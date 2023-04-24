(function(){
  // COMMON
  const header = document.querySelector('.header')
  const heroImage = document.querySelector('.common-hero-bg')
  const heroImageShadowPink = heroImage && heroImage.querySelector('.common-hero-img')
  const heroImageShadowBlue = heroImage && heroImage.querySelector('.common-hero-img-blue')
  const menuToggle = header.querySelector('.menu-toggle')
  const largeMovingText = document.querySelector('.large-moving-text')
  const contactUs = document.querySelector('.header-link')

  let mouseX = 0
  let mouseY = 0
  let x = 1
  let y = 1
  const mouseEasing = 0.05

  // Large moving text animation
  let paragraphs = []
  let veOffset = 0
  let coOffset = 0
  // let thisIsCoventuresVisible = false
  let paragraphOffsets = [0, 0, 0, 0]

  // Menu toggle
  const toggleBtnBars = [1, 2, 3]
  toggleBtnBars.map((i) => {
    const menuBar = document.createElement('span')
    menuBar.classList.add('toggle_bar', `toggle_bar-${i}`)
    menuToggle.appendChild(menuBar)
  })
  /////

  // Menu toggle
  menuToggle.addEventListener('click', () => {
    if(header.classList.contains('open')) {
      header.classList.remove('open')
    } else {
      header.classList.add('open')
    }
  })
  /////

  // This is Coventures animation
  const positionParagraphs = (paragraphs) => {
    if (paragraphs.length) {
      const veSpan = paragraphs[1].querySelectorAll('span')
      const ve = veSpan[10 % veSpan.length]
      const coSpan = paragraphs[3].querySelectorAll('span')
      const co = coSpan[8 % coSpan.length]
      veOffset = ve.offsetLeft
      coOffset = co.offsetLeft

      const pos0 = window.innerWidth / 2
      const offset0 = paragraphOffsets[0] - 1
      const offset1 = paragraphOffsets[1] - 1.2
      const offset2 =  paragraphOffsets[2] - 0.8
      const offset3 = paragraphOffsets[3] - 0.4

      paragraphOffsets = [
        (offset0 + pos0) / paragraphs[0].scrollWidth < -1 ? pos0 : offset0,
        (offset1 - veOffset) / paragraphs[1].scrollWidth < -1 ? window.innerWidth + veOffset : offset1,
        offset2 / paragraphs[2].scrollWidth < -1 ? window.innerWidth : offset2,
        (offset3 - coOffset) / paragraphs[3].scrollWidth < -1 ? window.innerWidth + coOffset : offset3,
      ]

      paragraphs[0].style.transform = `translateX(${pos0 + offset0}px)`
      paragraphs[1].style.transform = `translateX(${-veOffset + offset1}px)`
      paragraphs[2].style.transform = `translateX(${offset2}px)`
      paragraphs[3].style.transform = `translateX(${-coOffset + offset3}px)`
    }
  }

  if (largeMovingText) {
    const paragraph = largeMovingText.querySelector('p')
    const paragraphContainer = document.createElement('p')
    paragraph.innerHTML.split('').forEach((letter) => {
      const span = document.createElement('span')
      span.innerHTML = letter
      paragraphContainer.appendChild(span)
    })

    paragraphs = [
      paragraphContainer,
      paragraphContainer.cloneNode(true),
      paragraphContainer.cloneNode(true),
      paragraphContainer.cloneNode(true),
    ]

    paragraph.remove()

    paragraphs.forEach(p => {
      largeMovingText.appendChild(p)
    });
    // This is Coventures animation end
  }

  // Hero image
  const update = () => {
    if (largeMovingText) {
      positionParagraphs(paragraphs)
    }

    // Ease mouse position
    const targetX = mouseX;
    const dx = targetX - x;
    x += dx * mouseEasing;

    const targetY = mouseY;
    const dy = targetY - y;
    y += dy * mouseEasing;

    // Hero image shadow parallax
    if (heroImage && heroImageShadowPink && heroImageShadowBlue) {
      const mapMouseX = x / window.innerWidth - 0.5
      const mapMouseY = y / window.innerHeight - 0.5
      const translateShadowX = (mapMouseX) * 75
      const translateShadowY = (mapMouseY) * 75
      const translateShadowBlueX = (0.5 - mapMouseX) * 75
      const translateShadowBlueY = (0.5 - mapMouseY) * 75

      heroImageShadowPink.style.boxShadow = `${translateShadowX}px ${translateShadowY}px 100px 0 #ff7bac`
      heroImageShadowBlue.style.boxShadow = `${translateShadowBlueX}px ${translateShadowBlueY}px 100px 0 #00c5c1`
    }
    
    window.requestAnimationFrame(update)
  }
  //////

  window.requestAnimationFrame(update)

  contactUs.addEventListener('click', (e) => {
    const hsContactForm = document.querySelector('.hbspt-form')
    hsContactForm.classList.add('open')
    const iframe = hsContactForm.querySelector('.hs-form-iframe')
    const closeBtn = document.createElement('button')
    closeBtn.setAttribute('class', 'close-btn')
    closeBtn.style.left = `${iframe.offsetLeft + iframe.offsetWidth - 90}px`
    closeBtn.style.top = `${iframe.offsetTop - 120}px`
    hsContactForm.appendChild(closeBtn)
    closeBtn.addEventListener('click', () => {
      hsContactForm.classList.remove('open')
      closeBtn.remove()
    })
  })

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  })
})()
