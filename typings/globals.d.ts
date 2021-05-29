<<<<<<< HEAD
declare interface Window {
  webkitAudioContext: typeof AudioContext
}
=======
declare var webkitAudioContext: {
  new (): AudioContext;
};
>>>>>>> 62597ae (Use public folder, tighten types)
