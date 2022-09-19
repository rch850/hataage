/*
 * - 「あかあげて」
 * - 出題から一定時間後に判定
 * - 一定時間姿勢を保っていないと判定しない
 */

/** 姿勢推定のしきい値。高いほど厳しくなる */
const SCORE_THRESHOLD = 0.8;

/** 出題から判定までの待ち時間 */
const JUDGE_WAIT_SECONDS = 1.5;

/** 姿勢をこの秒数保ったらその姿勢になったとする */
const POSE_KEEP_SECONDS = 0.3;

let prevPose = [false, false];
let poseStartTime = 0;
let judgeStartTime = 0;
let answerPose = [false, false];
let soundCorrect = document.querySelector<HTMLAudioElement>('#sound-correct')!;

type GameState = {
  question: string
}

export let gameState: GameState = {
  question: ''
}

export function onPoseDetected(poses) {
  // About keypoints:
  // https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
  const keypoints = poses[0].keypoints;
  const leftWrist = keypoints[15];
  const rightWrist = keypoints[16];

  const isLeftValid = leftWrist.score >= SCORE_THRESHOLD;
  const isRightValid = rightWrist.score >= SCORE_THRESHOLD;
  if (prevPose[0] === isLeftValid && prevPose[1] === isRightValid) {
    // pass
  } else {
    prevPose = [isLeftValid, isRightValid];
    poseStartTime = Date.now();
  }

  if (judgeStartTime === 0) {
    makeQuestion();
  }

  if (judgeStartTime < Date.now()) {
    // 出題から一定時間が経過したので、判定開始
    if (poseStartTime + POSE_KEEP_SECONDS * 1000 < Date.now()) {
      if (answerPose[0] === prevPose[0] && answerPose[1] === prevPose[1]) {
        // 正解！
        soundCorrect.pause();
        soundCorrect.currentTime = 0;
        soundCorrect.play();
        makeQuestion();
      }
    }
  }
}

function makeQuestion() {
  const randomHand = Math.random();
  const randomFlag = Math.random();

  if (randomHand < 0.5) {
    // しろ
    if (randomFlag < 0.7) {
      answerPose[0] = !answerPose[0];
      gameState.question = answerPose[0] ? 'しろあげて' : 'しろさげて';
      judgeStartTime = Date.now();
    } else {
      if (Math.random() < 0.5) {
        gameState.question = answerPose[0] ? 'しろさげない' : 'しろあげない';
      } else {
        gameState.question = answerPose[0] ? 'しろさげないで' : 'しろあげないで';
      }
      gameState.question = answerPose[0] ? 'しろさげないで' : 'しろあげないで';
      judgeStartTime = Date.now() + JUDGE_WAIT_SECONDS * 1000;
    }
  } else {
    // あか
    if (randomFlag < 0.7) {
      answerPose[1] = !answerPose[1];
      gameState.question = answerPose[1] ? 'あかあげて' : 'あかさげて';
      judgeStartTime = Date.now();
    } else {
      if (Math.random() < 0.5) {
        gameState.question = answerPose[1] ? 'あかさげない' : 'あかあげない';
      } else {
        gameState.question = answerPose[1] ? 'あかさげないで' : 'あかあげないで';
      }
      judgeStartTime = Date.now() + JUDGE_WAIT_SECONDS * 1000;
    }
  }
  // あかしろあげて、などは未実装

  const utter = new SpeechSynthesisUtterance(gameState.question);
  utter.lang = 'ja';
  speechSynthesis.speak(utter);
}
