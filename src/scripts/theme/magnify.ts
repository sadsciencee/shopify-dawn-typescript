function toggleLoadingSpinner(image: HTMLImageElement) {
  const loadingSpinner = image?.parentElement?.parentElement?.querySelector(`[data-uc-spinner]`)
  if (!loadingSpinner) return
  loadingSpinner.classList.toggle('hidden')
}

function moveWithHover(
  image: HTMLImageElement,
  overlay: HTMLElement,
  event: MouseEvent,
  zoomRatio: number
) {
  // calculate mouse position
  const ratio = image.height / image.width
  const target: EventTarget | null = event.target
  if (!(target instanceof HTMLElement)) return
  const container = target.getBoundingClientRect()
  const xPosition = event.clientX - container.left
  const yPosition = event.clientY - container.top
  const xPercent = `${xPosition / (image.clientWidth / 100)}%`
  const yPercent = `${yPosition / ((image.clientWidth * ratio) / 100)}%`

  // determine what to show in the frame
  overlay.style.backgroundPosition = `${xPercent} ${yPercent}`
  overlay.style.backgroundSize = `${image.width * zoomRatio}px`
}

function magnify(image: HTMLImageElement, zoomRatio: number) {
  // create a container and set the full-size image as its background
  const overlayImage = document.createElement('img')
  overlayImage.setAttribute('src', `${image.src}`)
  const overlay = document.createElement('div')
  overlay.setAttribute('class', 'image-magnify-full-size')
  overlay.setAttribute('aria-hidden', 'true')
  overlay.style.backgroundImage = `url('${overlayImage.src}')`
  overlay.style.backgroundColor = 'var(--gradient-background)'

  image.style.opacity = '50%'
  toggleLoadingSpinner(image)

  overlayImage.onload = () => {
    toggleLoadingSpinner(image)
    const parent: HTMLElement | null = image.parentElement
    if (!parent) return
    parent.insertBefore(overlay, image)
    image.style.opacity = '100%'
  }

  overlay.onclick = () => overlay.remove()
  overlay.onmousemove = (event) => moveWithHover(image, overlay, event, zoomRatio)
  overlay.onmouseleave = () => overlay.remove()
  return overlay
}

export function enableZoomOnHover(zoomRatio: number): void {
  const images = document.querySelectorAll('.image-magnify-hover')
  if (!images) return
  for (let i = 0; i < images.length; i++) {
    const image = images[i] as HTMLImageElement
    if (!image) return
    image.onclick = (event) => {
      const overlay: HTMLElement = magnify(image, zoomRatio)
      if (!overlay) return
      moveWithHover(image, overlay, event, zoomRatio)
    }
  }
}
