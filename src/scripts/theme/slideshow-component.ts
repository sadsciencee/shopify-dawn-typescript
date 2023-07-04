import { SliderComponent } from '@/scripts/theme/slider-component'
import {
	currentTargetOptional,
	currentTargetRequired,
	qsaOptional,
	qsOptional,
	qsRequired,
	targetRequired,
} from '@/scripts/functions'
import { type uCoastWindow } from '@/scripts/setup'

declare let window: uCoastWindow

export class SlideshowComponent extends SliderComponent {
	static override htmlSelector = 'slideshow-component'
	sliderControlWrapper: HTMLElement
	sliderFirstItemNode: HTMLElement
	announcementBarSlider?: HTMLElement
	announcerBarAnimationDelay: number = 0
	announcementBarArrowButtonWasClicked?: boolean
	sliderControlLinksArray?: HTMLElement[]
	wasClicked?: boolean = false
	desktopLayout?: MediaQueryList
	reducedMotion?: MediaQueryList
	autoplaySpeed: number = 0
	sliderAutoplayButton?: HTMLButtonElement
	sliderControlButtons?: NodeListOf<HTMLButtonElement>
	autoplayButtonIsSetToPlay: boolean = false
	setPositionTimeout?: number
	autoplay?: number
	constructor() {
		super()
		this.sliderFirstItemNode = qsRequired('.slideshow__slide', this.slider)
		this.sliderControlWrapper = qsRequired('.slider-buttons', this)
		this.enableSliderLooping = true

		if (!this.sliderControlWrapper) return

		if (this.sliderItemsToShow && this.sliderItemsToShow.length > 0) this.currentPage = 1

		this.announcementBarSlider = qsOptional('.announcement-bar-slider', this)
		// Value below should match --duration-announcement-bar CSS value
		this.announcerBarAnimationDelay = this.announcementBarSlider ? 250 : 0

		this.sliderControlLinksArray = Array.from(
			this.sliderControlWrapper.querySelectorAll('.slider-counter__link')
		)
		this.sliderControlLinksArray.forEach((link) =>
			link.addEventListener('click', this.linkToSlide.bind(this))
		)
		this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this))
		this.setSlideVisibility()

		if (this.announcementBarSlider) {
			this.announcementBarArrowButtonWasClicked = false

			this.desktopLayout = window.matchMedia('(min-width: 750px)')
			this.desktopLayout?.addEventListener('change', () => {
				if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay()
			})
			this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
			this.reducedMotion?.addEventListener('change', () => {
				if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay()
			})
			this.prevButton?.addEventListener(
				'click',
				() => {
					this.announcementBarArrowButtonWasClicked = true
				},
				{ once: true }
			)
			this.nextButton?.addEventListener(
				'click',
				() => {
					this.announcementBarArrowButtonWasClicked = true
				},
				{ once: true }
			)
		}

		if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay()
	}

	setAutoPlay() {
		this.autoplaySpeed = this.slider.dataset.speed
			? parseInt(this.slider.dataset.speed) * 1000
			: 0
		this.addEventListener('mouseover', this.focusInHandling.bind(this))
		this.addEventListener('mouseleave', this.focusOutHandling.bind(this))
		this.addEventListener('focusin', this.focusInHandling.bind(this))
		this.addEventListener('focusout', this.focusOutHandling.bind(this))

		if (this.querySelector('.slideshow__autoplay')) {
			this.sliderAutoplayButton = qsOptional('.slideshow__autoplay', this)
			if (!this.sliderAutoplayButton) throw new Error('Autoplay button not found')
			this.sliderAutoplayButton.addEventListener('click', this.autoPlayToggle.bind(this))
			this.autoplayButtonIsSetToPlay = true
			this.play()
		} else {
			;(this.reducedMotion && this.reducedMotion.matches) ||
			this.announcementBarArrowButtonWasClicked ||
			(this.desktopLayout && !this.desktopLayout.matches)
				? this.pause()
				: this.play()
		}
	}

	override onButtonClick(event: MouseEvent) {
		super.onButtonClick(event)
		if (!this.sliderItemsToShow)
			throw Error(
				'onButtonClick fired before this.sliderItemsToShow was set, in SlideshowComponent class'
			)
		this.wasClicked = true

		const isFirstSlide = this.currentPage === 1
		const isLastSlide = this.currentPage === this.sliderItemsToShow.length
		const currentTarget = currentTargetOptional(event)
		if (!(currentTarget instanceof HTMLButtonElement))
			throw Error('currentTarget is not button element in SlideshowComponent class')

		if (!isFirstSlide && !isLastSlide) {
			this.applyAnimationToAnnouncementBar(currentTarget.name)
			return
		}

		if (isFirstSlide && currentTarget.name === 'previous') {
			this.slideScrollPosition =
				this.slider.scrollLeft +
				this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length
		} else if (isLastSlide && currentTarget.name === 'next') {
			this.slideScrollPosition = 0
		}

		this.setSlidePosition(this.slideScrollPosition ?? 0)

		this.applyAnimationToAnnouncementBar(currentTarget.name)
	}

	override setSlidePosition(position: number) {
		if (this.setPositionTimeout) clearTimeout(this.setPositionTimeout)
		this.setPositionTimeout = setTimeout(() => {
			this.slider.scrollTo({
				left: position,
			})
		}, this.announcerBarAnimationDelay)
	}

	override update() {
		super.update()
		if (!this.currentPage)
			throw Error('this.currentPage is not set in SlideshowComponent class')
		this.sliderControlButtons = qsaOptional('.slider-counter__link', this)
		this.prevButton?.removeAttribute('disabled')

		if (!this.sliderControlButtons) return

		this.sliderControlButtons.forEach((link) => {
			link.classList.remove('slider-counter__link--active')
			link.removeAttribute('aria-current')
		})

		this.sliderControlButtons[this.currentPage - 1].classList.add(
			'slider-counter__link--active'
		)
		this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', 'true')
	}

	autoPlayToggle() {
		this.togglePlayButtonState(this.autoplayButtonIsSetToPlay)
		this.autoplayButtonIsSetToPlay ? this.pause() : this.play()
		this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay
	}

	focusOutHandling(event: Event) {
		if (this.sliderAutoplayButton) {
			const eventTarget = targetRequired(event)
			const focusedOnAutoplayButton =
				event.target === this.sliderAutoplayButton ||
				this.sliderAutoplayButton.contains(eventTarget)
			if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return
			this.play()
		} else if (
			this.reducedMotion &&
			!this.reducedMotion.matches &&
			!this.announcementBarArrowButtonWasClicked &&
			this.desktopLayout &&
			this.desktopLayout.matches
		) {
			this.play()
		}
	}

	focusInHandling(event: Event) {
		const eventTarget = targetRequired(event)
		if (this.sliderAutoplayButton) {
			const focusedOnAutoplayButton =
				event.target === this.sliderAutoplayButton ||
				this.sliderAutoplayButton.contains(eventTarget)
			if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
				this.play()
			} else if (this.autoplayButtonIsSetToPlay) {
				this.pause()
			}
		} else if (this.announcementBarSlider && this.announcementBarSlider.contains(eventTarget)) {
			this.pause()
		}
	}

	play() {
		this.slider.setAttribute('aria-live', 'off')
		clearInterval(this.autoplay)
		this.autoplay = setInterval(this.autoRotateSlides.bind(this), this.autoplaySpeed)
	}

	pause() {
		this.slider.setAttribute('aria-live', 'polite')
		clearInterval(this.autoplay)
	}

	togglePlayButtonState(pauseAutoplay: boolean) {
		if (!this.sliderAutoplayButton)
			throw new Error('togglePlayButtonState called early - no autoplay button found')
		if (pauseAutoplay) {
			this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused')
			this.sliderAutoplayButton.setAttribute(
				'aria-label',
				window.accessibilityStrings.playSlideshow
			)
		} else {
			this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused')
			this.sliderAutoplayButton.setAttribute(
				'aria-label',
				window.accessibilityStrings.pauseSlideshow
			)
		}
	}

	autoRotateSlides() {
		if (!this.sliderItemOffset)
			throw new Error('autoRotateSlides called early - no sliderItemOffset found')
		const slideScrollPosition =
			this.currentPage === this.sliderItems.length
				? 0
				: this.slider.scrollLeft + this.sliderItemOffset

		this.setSlidePosition(slideScrollPosition)
		this.applyAnimationToAnnouncementBar()
	}

	setSlideVisibility(_event: Event | undefined = undefined) {
		if (this.sliderItemsToShow) {
			this.sliderItemsToShow.forEach((item, index) => {
				const linkElements = item.querySelectorAll('a')
				if (!this.currentPage)
					throw new Error('setSlideVisibility called early - no currentPage found')
				if (index === this.currentPage - 1) {
					if (linkElements.length)
						linkElements.forEach((button) => {
							button.removeAttribute('tabindex')
						})
					item.setAttribute('aria-hidden', 'false')
					item.removeAttribute('tabindex')
				} else {
					if (linkElements.length)
						linkElements.forEach((button) => {
							button.setAttribute('tabindex', '-1')
						})
					item.setAttribute('aria-hidden', 'true')
					item.setAttribute('tabindex', '-1')
				}
			})
		} else {
			throw new Error('setSlideVisibility called too early')
		}

		this.wasClicked = false
	}

	applyAnimationToAnnouncementBar(button = 'next') {
		if (!this.announcementBarSlider) return
		if (!this.currentPage)
			throw new Error('applyAnimationToAnnouncementBar called early - no currentPage found')

		const itemsCount = this.sliderItems.length
		const increment = button === 'next' ? 1 : -1

		const currentIndex = this.currentPage - 1
		let nextIndex = (currentIndex + increment) % itemsCount
		nextIndex = nextIndex === -1 ? itemsCount - 1 : nextIndex

		const nextSlide = this.sliderItems[nextIndex]
		const currentSlide = this.sliderItems[currentIndex]

		const animationClassIn = 'announcement-bar-slider--fade-in'
		const animationClassOut = 'announcement-bar-slider--fade-out'

		const isFirstSlide = currentIndex === 0
		const isLastSlide = currentIndex === itemsCount - 1

		const shouldMoveNext =
			(button === 'next' && !isLastSlide) || (button === 'previous' && isFirstSlide)
		const direction = shouldMoveNext ? 'next' : 'previous'

		currentSlide.classList.add(`${animationClassOut}-${direction}`)
		nextSlide.classList.add(`${animationClassIn}-${direction}`)

		setTimeout(() => {
			currentSlide.classList.remove(`${animationClassOut}-${direction}`)
			nextSlide.classList.remove(`${animationClassIn}-${direction}`)
		}, this.announcerBarAnimationDelay * 2)
	}

	linkToSlide(event: Event) {
		event.preventDefault()
		if (!this.sliderControlLinksArray || !this.currentPage)
			throw new Error(
				'linkToSlide called early - no sliderControlLinksArray or currentPage found'
			)
		const currentTarget = currentTargetRequired(event)
		const slideScrollPosition =
			this.slider.scrollLeft +
			this.sliderFirstItemNode.clientWidth *
				(this.sliderControlLinksArray.indexOf(currentTarget) + 1 - this.currentPage)
		this.slider.scrollTo({
			left: slideScrollPosition,
		})
	}
}
