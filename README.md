# Image Search Abstraction Layer

1. You can get the image URLs, alt text and page urls for a set of images relating to a given search string.
2. You can paginate through the responses by adding a ?offset=2 parameter to the URL.
3. You can get a list of the most recently submitted search strings.

## Example Search Usage:
`https://fcc-zhenmao-image-search-abstraction-layer.glitch.me/api/imagesearch/cute%20cat?offset=2`

## Example Recent Search Strings Usage:
`https://fcc-zhenmao-image-search-abstraction-layer.glitch.me/api/latest/imagesearch`