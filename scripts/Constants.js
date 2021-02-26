class Constants {}

Constants.noteFrequencies = {
  'c0': 16.35,
  'c♯0': 17.32,
  'd0': 18.35,
  'e♭0': 19.45,
  'e0': 20.60,
  'f0': 21.83,
  'f#0': 23.12,
  'g0': 24.50,
  'a♭0': 25.96,
  'a0': 27.50,
  'b♭0': 29.14,
  'b0': 30.87
}

Constants.noteKeys = Object.keys(Constants.noteFrequencies);

Constants.originalNoteColorObjects = {
  'c': [254, 254, 9],
  'c♯': [156, 250, 16],
  'd': [11, 202, 29],
  'e♭': [22, 241, 199],
  'e': [7, 49, 249],
  'f': [94, 5, 252],
  'f#': [207, 1, 241],
  'g': [11, 0, 10],
  'a♭': [100, 2, 1],
  'a': [248, 5, 14],
  'b♭': [242, 56, 19],
  'b': [241, 103, 28]
}

Constants.noteColorObjects = {
  'c': [254, 254, 9],
  'c♯': [156, 250, 16],
  'd': [11, 202, 29],
  'e♭': [22, 241, 199],
  'e': [7, 49, 249],
  'f': [94, 5, 252],
  'f#': [207, 1, 241],
  'g': [11, 0, 10],
  'a♭': [100, 2, 1],
  'a': [248, 5, 14],
  'b♭': [242, 56, 19],
  'b': [241, 103, 28]
}

//get index for energy array from pitch
Constants.noteColorOffset = {
  'c': 0,
  'c♯': 1,
  'd': 2,
  'e♭': 3,
  'e': 4,
  'f': 5,
  'f#': 6,
  'g': 7,
  'a♭': 8,
  'a': 9,
  'b♭': 10,
  'b': 11
}

Constants.notes = Object.keys(Constants.noteColorObjects);