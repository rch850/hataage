/*
 * - 「あかあげて」
 * - 出題から1秒後に判定
 */
let prevPose = [false, false];
let poseStartTime = 0;
let questionStartTime = 0;
let answerPose = [false, false];

type GameState = {
  question: string
}

export let gameState: GameState = {
  question: 'あかあげて'
}

export function onPoseDetected(poses) {
  // About keypoints:
  // https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
  const keypoints = poses[0].keypoints;
  const leftWrist = keypoints[15];
  const rightWrist = keypoints[16];

  const SCORE_THRESHOLD = 0.5;
  const isLeftValid = leftWrist.score >= SCORE_THRESHOLD;
  const isRightValid = rightWrist.score >= SCORE_THRESHOLD;
  if (prevPose[0] === isLeftValid && prevPose[1] === isRightValid) {
    // pass
  } else {
    prevPose = [isLeftValid, isRightValid];
    poseStartTime = Date.now();
  }

  if (questionStartTime === 0) {
    questionStartTime = Date.now();
    makeQuestion();
  }

  if (questionStartTime + 2000 < Date.now()) {
    // 出題から一定時間が経過したので、判定開始
    if (poseStartTime + 1000 < Date.now()) {
      if (answerPose[0] === prevPose[0] && answerPose[1] === prevPose[1]) {
        makeQuestion();
        questionStartTime = Date.now();
        poseKeepCount = 0;
      }
    }
  }
}

function makeQuestion() {
  const randomHand = Math.random();
  const randomFlag = Math.random();
  if (randomHand < 0.5) {
    // あか
    if (randomFlag < 0.7) {
      answerPose[0] = !answerPose[0];
      gameState.question = answerPose[0] ? 'あかあげて' : 'あかさげて';
    } else {
      gameState.question = answerPose[0] ? 'あかさげないで' : 'あかあげないで';
    }
  } else if (randomHand < 1.1) {
    // しろ
    if (randomFlag < 0.7) {
      answerPose[1] = !answerPose[1];
      gameState.question = answerPose[1] ? 'しろあげて' : 'しろさげて';
    } else {
      gameState.question = answerPose[1] ? 'しろさげないで' : 'しろあげないで';
    }
  } else {
    // あかしろ
  }
}
