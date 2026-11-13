# Product category images

The category editor in the merchant catalog supports an optional image during creation or editing. JPEG, PNG and WebP files must be nonempty and at most 5 MiB. The selected image is previewed locally; replacing or removing it is saved with the category in one request. Closing with unsaved name or image changes prompts before discarding them. Controls are disabled while saving; API errors remain inside the dialog and preserve the selection for retry.

Category rows show a 40 × 40 image or the existing dashed placeholder when the image is absent or fails to load. Object URLs for local previews are released when replaced, removed, discarded or the component is destroyed.

MerchantApiService keeps ordinary name-only requests as JSON. With an image it sends multipart/form-data to the existing category POST/PUT endpoint: category is an application/json Blob, image is the selected File. Removal uses removeImage=true on PUT. The backend rejects simultaneous upload and removal. Responses expose optional imageUrl, a temporary signed URL; reload categories to refresh it.

Deploy backend issue elegant-software/zack-pay#251 and its Liquibase migration before deploying this dashboard change (issue #98).
