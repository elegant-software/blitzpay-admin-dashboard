# Merchant white label

Open a merchant profile and select **White label**. Choose Shopper mobile, Merchant mobile, Web storefront/PWA or Kitchen screen, then edit merchant defaults or a branch override on the dedicated settings page.

The editor supports display name, page/app title, default and dark logos, device/light/dark appearance, named theme palettes and visible merchant offerings. Each palette has background, surface, card, foreground, muted text, action, border and status roles. Contrast warnings block publishing; the backend validates the same rules.

**Publish changes** saves this app and scope immediately. **Save palette** stores only a reusable theme. **Apply to draft** copies a saved palette; it does not publish. Clearing optional identity fields inherits. Each color-mode palette inherits as a whole until a local color is edited. Reset removes local overrides. A merchant may disable branch branding or hide a feature, and branches cannot reenable it.

Unsaved edits are guarded during scope/app changes and navigation. Errors stay beside the action buttons. Stale revisions return a conflict; reload after choosing to discard your draft and review before publishing again.

API calls remain in MerchantApiService. The white-label route preserves the merchant page's environment selection. Only admin src/app files are changed; projects/blitz-pay-web is untouched. This configures future consumer integration and does not change mobile apps, storefront rendering, kitchen rendering, installed icons, package IDs or domains.

Backend contract and rollout notes: D:/projects/spring/zack-pay/reference/merchant-white-label.md.

Merchant managers can use /merchant-branding/{merchantId}?environment=local (or the configured staging environment key) as a standalone entry point. The route checks a valid token and asks the backend to verify the manager assignment before opening the editor. It does not expose the admin shell or relax the platform-admin gate on any existing dashboard route. A platform admin can use either entry point.

The white-label editor is a full page, as explicitly requested by the user, overriding the generic merchant-catalog dialog convention for this feature. Sections cover identity, logos, saved themes, colors and visible features. A desktop preview stays alongside the form, with a single-column layout on small screens. Publishing actions remain available while scrolling. Discard changes restores the last saved state while keeping the editor open; route and browser guards still protect unsaved changes.

Section links scroll and focus the matching section within the current page. Native fragment navigation is prevented because the document base URL points to the application root; these links must not reload the document, change routes, refetch settings or discard the draft.
