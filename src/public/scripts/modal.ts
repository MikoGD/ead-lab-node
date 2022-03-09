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
    $({ deg: 0 }).animate(
      { deg: 315 },
      {
        duration: 1000,
        step: function (now) {
          $('#modalSquare').css({ transform: `rotate(${now}deg)` });
        },
      }
    );
  });

  $('#modalResetButton').on('click', () => {
    $('#modalSquare').css('transform', 'rotate(0)').show();
  });
}
