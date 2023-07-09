import { getAttributeOrThrow, qsOptional } from '@/scripts/functions';
import { UcoastEl } from '@/scripts/core/UcoastEl';
import { mediaLoader } from '@/scripts/mediaLoader';

export class ProductRecommendations extends UcoastEl {
  static htmlSelector = 'product-recommendations';
  constructor() {
    super();
  }

  override connectedCallback() {
    const handleIntersection = (entries:IntersectionObserverEntry[], observer:IntersectionObserver) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);

      const fetchUrl = getAttributeOrThrow('data-url', this);

      fetch(fetchUrl)
        .then((response) => response.text())
        .then((text) => {
          const html = document.createElement('div');
          html.innerHTML = text;
          const recommendations = qsOptional<ProductRecommendations>('product-recommendations', html)

          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
            mediaLoader()
          }

          if (!this.querySelector('slideshow-component') && this.classList.contains('complementary-products')) {
            this.remove();
          }

          if (html.querySelector('.grid__item')) {
            this.classList.add('product-recommendations--loaded');
          }
        })
        .catch((e) => {
          console.error(e);
        });
    };

    new IntersectionObserver(handleIntersection.bind(this), { rootMargin: '0px 0px 400px 0px' }).observe(this);
  }
}
