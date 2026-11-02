#!/usr/bin/env bash
# setup-k8s-repo-secrets.sh
#
# Creates Kubernetes connection secrets (K8S_SERVER, K8S_CA_CERT, K8S_TOKEN)
# at the GitHub **repository** level.
# Uses the GitHub CLI (gh). Run once when bootstrapping repo-scoped K8S access.
#
# Usage:
#   .github/scripts/setup-k8s-repo-secrets.sh
#
# Prerequisites:
#   - gh CLI installed and authenticated (gh auth login)
#   - kubectl configured with access to the target cluster
#   - openssl installed (for CA cert extraction)
#
# Update this file whenever a new K8S-related repository secret is added to a workflow.

set -euo pipefail

# ─── SHARED HELPERS ──────────────────────────────────────────────────────────

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

set_repo_secret() {
  local name="$1"
  local value="$2"
  gh secret set "$name" --body "$value" --repo "$REPO"
  echo "           Set."
}

# ─── KUBERNETES SETUP ────────────────────────────────────────────────────────
# Sets K8S_SERVER + K8S_CA_CERT + K8S_TOKEN repository secrets and creates the
# deploy service account in the cluster.

setup_k8s() {
  echo "Setting up Kubernetes repository secrets..."
  echo ""

  # --- K8S_SERVER ---
  read -r -p "  [secret] K8S_SERVER (API server URL, e.g. https://192.168.1.100:6443): " k8s_server
  while [ -z "$k8s_server" ]; do
    echo "           This secret is required."
    read -r -p "  [secret] K8S_SERVER: " k8s_server
  done

  set_repo_secret K8S_SERVER "$k8s_server"

  # --- K8S_CA_CERT (cluster CA from the current kubeconfig context) ---
  # Not taken from the TLS handshake: the API server sends only its own serving cert,
  # and pinning that breaks with "x509: unknown authority" whenever it is renewed.
  echo "  [secret] K8S_CA_CERT — reading cluster CA from kubeconfig context $(kubectl config current-context) ..."
  local ca_b64
  ca_b64=$(kubectl config view --raw --minify -o jsonpath='{.clusters[0].cluster.certificate-authority-data}')
  if [ -z "$ca_b64" ]; then
    echo "  ERROR: current kubeconfig context has no certificate-authority-data"
    exit 1
  fi
  echo "           CA: $(echo "$ca_b64" | base64 -d | openssl x509 -noout -subject)"

  set_repo_secret K8S_CA_CERT "$ca_b64"

  # --- Service account + long-lived token ---
  local sa_name="blitzpay-deploy"
  local sa_ns="kube-system"
  local secret_name="${sa_name}-token"

  echo ""
  echo "  Creating service account $sa_ns/$sa_name ..."

  # create --dry-run | apply is idempotent: safe to re-run when these already exist.
  kubectl create sa "$sa_name" -n "$sa_ns" --dry-run=client -o yaml | kubectl apply -f -

  kubectl create clusterrolebinding "$sa_name-binding" \
    --clusterrole=cluster-admin \
    --serviceaccount="$sa_ns:$sa_name" \
    --dry-run=client -o yaml | kubectl apply -f -

  # Create a Secret-based long-lived token (works on all K8S versions)
  if ! kubectl get secret "$secret_name" -n "$sa_ns" &>/dev/null; then
    kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: $secret_name
  namespace: $sa_ns
  annotations:
    kubernetes.io/service-account.name: $sa_name
type: kubernetes.io/service-account-token
EOF
    echo "  Created secret $sa_ns/$secret_name"
    # Wait for the token controller to populate the token
    sleep 2
  fi

  local token
  token=$(kubectl get secret "$secret_name" -n "$sa_ns" -o jsonpath='{.data.token}' | base64 -d)

  if [ -z "$token" ]; then
    echo "  ERROR: token not populated in secret $secret_name"
    exit 1
  fi

  set_repo_secret K8S_TOKEN "$token"
  echo "  [secret] K8S_TOKEN — extracted from secret $sa_ns/$secret_name"
  echo ""
}

# ─── MAIN ────────────────────────────────────────────────────────────────────

echo "Configuring Kubernetes repository secrets for: $REPO"
echo ""

setup_k8s

echo "Done. This repository can now reference these secrets in GitHub Actions."
