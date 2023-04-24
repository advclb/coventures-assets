(function(){
  // HOME
  const videoContainer = document.querySelector('.video_zoom_out')
  const videoMask = document.querySelector('.video_zoom_out .zoom_out')
  const video = document.querySelector('.video_zoom_out video')
  const sectionAbout = document.querySelector('.section-about')
  const sectionProblem = document.querySelector('.section-problem')
  const sectionNext = document.querySelector('.section-next')
  const largeMovingText = document.querySelector('.large-moving-text')

  let scrollY = 0
  let sY = 0
  const scrollEasing = 0.1
  let sandboxBlobExplode
  let sandboxBlobDrop

  let mouseX = 0
  let mouseY = 0
  let x = 1
  let y = 1
  const mouseEasing = 0.05

  const canvasBlobExplode = document.querySelector('.canvasBlobExplode')
  const canvasBlobDrop = document.querySelector('.canvasBlobDrop')

  const onResize = () => {
    if (canvasBlobExplode) {
      canvasBlobExplode.width = window.innerWidth
      canvasBlobExplode.height = window.innerHeight
    }
    if (canvasBlobDrop) {
      canvasBlobDrop.width = window.innerWidth
      canvasBlobDrop.height = window.innerHeight
    }
  }

  // Blob explode shader
  if (canvasBlobExplode) {
    // fetch('./blob_explode.frag')
    fetch('https://raw.githubusercontent.com/advclb/coventures-assets/main/blob_explode.frag')
      .then(response => response.text())
      .then((data) => {
        sandboxBlobExplode = new GlslCanvas(canvasBlobExplode)
        sandboxBlobExplode.load(data)
        onResize()
      })
  }
  /////

  // Blob drop shader
  if (canvasBlobDrop) {
    // fetch('./blob_drop.frag')
    fetch('https://raw.githubusercontent.com/advclb/coventures-assets/main/blob_drop.frag')
      .then(response => response.text())
      .then((data) => {
        sandboxBlobDrop = new GlslCanvas(canvasBlobDrop)
        sandboxBlobDrop.load(data)
        onResize()
      })
  }
  /////

  const update = () => {
    // Ease mouse position
    const targetX = mouseX;
    const dx = targetX - x;
    x += dx * mouseEasing;

    const targetY = mouseY;
    const dy = targetY - y;
    y += dy * mouseEasing;

    // Ease scroll position
    const targetSY = scrollY;
    const dsy = targetSY - sY;
    sY += dsy * scrollEasing;

    if (largeMovingText && sectionNext) {
      const size = Math.max(window.innerWidth, window.innerHeight) * 2
      const mappedScrollY = (sY - largeMovingText.offsetTop + window.innerHeight / 2) / window.innerHeight
      const videoFadeIn = Math.min((sY - sectionNext.offsetTop + window.innerHeight / 2) / -window.innerHeight, 0) * -1.5
      
      // Video mask
      if (videoMask) {
        const videoFadeOut = Math.max( Math.min((sY - largeMovingText.offsetTop + window.innerHeight / 2) / -window.innerHeight), 0)
        const targetScrollY = (videoFadeOut + videoFadeIn) * size
        videoMask.style.width = `${targetScrollY}px`
        videoMask.style.height = `${targetScrollY}px`
        const videoTranslate = Math.max(1.3 - Math.min((targetScrollY / size) * 2, 1.3), 0) * window.innerWidth * 0.2
        // console.log('targetScrollY', videoFadeIn, targetScrollY, videoTranslate);
        if (videoFadeIn > 0) {
          video.style.transform = 'translate(0px)'
          videoContainer.classList.add('bottom')
        } else {
          video.style.transform = `translate(${videoTranslate}px)`
          videoContainer.classList.remove('bottom')
        }
      }

      if (canvasBlobExplode && sandboxBlobExplode && sectionAbout) {
        const s = Math.max(mappedScrollY, 0)

        if (sandboxBlobExplode) {
          const fadeIn = Math.min(Math.max(mappedScrollY, 0) * 20, 1)
          const fadeOut = scrollY - sectionAbout.offsetTop - sectionAbout.offsetHeight / 2 > 0 ? 0 : 1
          canvasBlobExplode.style.opacity = fadeIn * fadeOut
          sandboxBlobExplode.setUniform('u_scroll', s)
          sandboxBlobExplode.setUniform('u_mouse_x', x)
          sandboxBlobExplode.setUniform('u_mouse_y', y)
        }
      }

      if (sectionProblem && canvasBlobDrop && sandboxBlobDrop) {
        const s = Math.max(3.5 - (scrollY - sectionProblem.offsetTop + window.innerHeight) / window.innerHeight)

        if (s) {
          if (s > 3.35) {
            canvasBlobDrop.style.display = 'none'
          } else {
            canvasBlobDrop.style.display = 'block'
          }
          if (videoFadeIn > 0) {
            canvasBlobDrop.style.transform = `scale(${Math.max(1 - videoFadeIn * 4, 0)})`
          } else {
            canvasBlobDrop.style.transform = 'scale(1)'
          }
          sandboxBlobDrop.setUniform('u_scroll', s)
          sandboxBlobDrop.setUniform('u_mouse_x', x)
          sandboxBlobDrop.setUniform('u_mouse_y', y)
        }
      }
    }
    
    window.requestAnimationFrame(update)
  }
  //////

  window.requestAnimationFrame(update)

  // Resize
  onResize()
  window.addEventListener('resize', onResize)

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  })

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY
  })
})()
