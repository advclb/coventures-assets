(function(){
  // ABOUT
  const personCards = document.querySelectorAll('.person-card')

  // Open and close people cards
  const openCards = (e, personCard) => {
    personCard.parentElement.classList.add('open')
    personCard.classList.add('open')
    personCard.parentElement.style.paddingBottom = `${personCard.offsetHeight * 2}px`

    const closeButtonWidth = 80

    if (e.offsetX >= personCard.offsetWidth * 2 - closeButtonWidth && e.offsetY <= closeButtonWidth) {
      personCard.parentElement.classList.remove('open')
      personCard.parentElement.style.paddingBottom = '0px'
      personCards.forEach((card) => {
        card.classList.remove('open', 'translate', 'translate-2')
      })
      return
    }

    const top = personCard.offsetTop - personCard.parentElement.offsetTop
    const left = personCard.offsetLeft - personCard.parentElement.offsetLeft
    const lastLeft = personCard.parentElement.offsetWidth - personCard.offsetWidth
    const isLastInRow = left === lastLeft

    if (isLastInRow) {
      personCard.classList.add('left')
    }

    if (personCard.classList.contains('open')) {
      Array.from(personCards).forEach((card) => {
        const thisLeft = card.offsetLeft - card.parentElement.offsetLeft
        const thisTop = card.offsetTop - card.parentElement.offsetTop

        if (card === personCard) {
          card.style.height = `${personCard.offsetHeight}px`
        } else {
          card.style.height = ''
        }

        // Check if it's the last card in the row

        const isAdjecent =  card !== personCard && // Not the clicked card
                            (isLastInRow
                              ? thisLeft >= left - card.offsetWidth // Same column or to the left (if last in row)
                              : thisLeft >= left // Same column or to the right
                            ) &&
                            thisTop >= top && // Same row or below
                            thisLeft <= left + card.offsetWidth // Within horizontal bounds

        if (isAdjecent) {
          if (
            isLastInRow
              ? thisLeft >= left - card.offsetWidth && thisLeft < left
              : thisLeft >= left + card.offsetWidth
          ) {
            card.classList.add('translate-2') // Next row
          } else {
            card.classList.add('translate') // Same row
          }
        }
      })
    } else {
      personCards.forEach((card) => {
        card.classList.remove('open')
      })
    }
  }

  if (personCards) {
    personCards.forEach((personCard) => {
      // Add line break before last name
      const name = personCard.querySelector('.person-card-name')
      const nameText = name.innerText
      const nameArray = nameText.split(' ')
      name.innerHTML = nameArray.map((word, i) => i === nameArray.length - 1 ? `<br>${word}` : word).join(' ')

      const tabs = personCard.querySelector('.person-card-hover').childNodes
      tabs.forEach((tab, i) => {
        const tabContent = tab.querySelector('.person-card-tab-content')
        tabContent.setAttribute('data-original-height', tabContent.offsetHeight)
        tabContent.style.height = '0px'

        if (i === 0) {
          tab.classList.add('open')
          tabContent.style.height = `${tabContent.dataset.originalHeight}px`
        }

        tab.querySelector('.person-tab-button').addEventListener('click', () => {
          tabs.forEach((t, j) => {
            const thisTabContent = t.querySelector('.person-card-tab-content')
            if (i !== j) {
              t.classList.remove('open')
              thisTabContent.style.height = '0px'
            } else {
              t.classList.remove('open')
              thisTabContent.style.height = `${thisTabContent.dataset.originalHeight}px`
            }
          })

          tab.classList.add('open')
          tabContent.style.height = `${tabContent.dataset.originalHeight}px`
        })
      })

      personCard.addEventListener('click', (e) => {
        if (personCard.parentElement.classList.contains('open')) {
          if (personCard.classList.contains('open')) {
            openCards(e, personCard)
            return
          }

          personCard.parentElement.classList.remove('open')

          const filteredCards = Array.from(personCards).reduce((prev, card) => {
            const isOpen = card.classList.contains('open') || card.classList.contains('translate') || card.classList.contains('translate-2')
            const isAnimationDone = new Promise((resolve) => {
              card.parentElement.addEventListener('transitionend', () => {
                resolve()
              })
            })
            return isOpen ? [...prev, isAnimationDone] : prev
          }, [])

          Array.from(personCards).forEach((card) => {
            card.classList.remove('open', 'translate', 'translate-2')
          })

          Promise.all(filteredCards)
            .then(() => {
              openCards(e, personCard)
            }
          )
        } else {
          openCards(e, personCard)
        }
      })
    })
  }
})()
