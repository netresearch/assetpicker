// Build definition for `docker buildx bake`.
// Build the dev image with:  docker buildx bake
// compose.yml references the same tag, so `docker compose up` reuses it.

variable "TAG" {
  default = "latest"
}

group "default" {
  targets = ["php"]
}

target "php" {
  context    = "."
  dockerfile = "Dockerfile"
  tags       = ["assetpicker-php:${TAG}"]
}
