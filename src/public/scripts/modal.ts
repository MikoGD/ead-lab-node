export function openModal() {
  $('#modalContainer').show();
}

export function setupModalButtons() {
  $('#closeModalButton').on('click', () => {
    $('#modalContainer').hide();
  });

  $('#modalFadeOutButton').on('click', () => {
    $('#modalSquare').fadeOut();
  });

  $('#modalFadeInButton').on('click', () => {
    $('#modalSquare').fadeIn();
  });

  $('#modalSpinButton').on('click', () => {
    $('#modalSquare').animate(
      {
        borderSpacing: 315,
      },
      {
        duration: 1000,
        step: function (now) {
          $(this).css('-webkit-transform', 'rotate(' + now + 'deg)');
          $(this).css('-moz-transform', 'rotate(' + now + 'deg)');
          $(this).css('transform', 'rotate(' + now + 'deg)');
        },
      }
    );
  });

  $('#modalResetButton').on('click', () => {
    $('#modalSquare').css('transform', 'rotate(0)').show();
  });
}
