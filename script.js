let posenet;
let singlePose, skeleton;
let feedbackText = "";

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight); // Create canvas to fit the full window
    canvas.parent('canvasContainer'); // Attach the canvas to the div container
    capture = createCapture(VIDEO);
    capture.hide();

    posenet = ml5.poseNet(capture, modelLoaded);
    posenet.on('pose', receivedPoses);
}

function receivedPoses(poses) {
    console.log(poses);

    if (poses.length > 0) {
        singlePose = poses[0].pose;
        skeleton = poses[0].skeleton;
        checkPose(singlePose);
    }
}

function modelLoaded() {
    console.log('Model has loaded');
}

function checkPose(pose) {
    let leftWrist = pose.leftWrist;
    let rightWrist = pose.rightWrist;
    let leftShoulder = pose.leftShoulder;
    let rightShoulder = pose.rightShoulder;
    let leftHip = pose.leftHip;
    let rightHip = pose.rightHip;

    // T-pose detection
    let armDiffLeft = abs(leftWrist.y - leftShoulder.y);
    let armDiffRight = abs(rightWrist.y - rightShoulder.y);
    let shoulderDistance = dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y);
    let wristDistance = dist(leftWrist.x, leftWrist.y, rightWrist.x, rightWrist.y);

    if (armDiffLeft < 50 && armDiffRight < 50 && wristDistance > shoulderDistance * 1.5) {
        feedbackText = "T-pose detected!";
    }
    // Tree pose detection
    else if (pose.leftKnee.confidence > 0.5 && pose.rightKnee.confidence > 0.5) {
        let leftKnee = pose.leftKnee;
        let rightKnee = pose.rightKnee;

        if (leftKnee.y < leftHip.y || rightKnee.y < rightHip.y) {
            feedbackText = "Tree pose detected!";
        } else {
            feedbackText = "";
        }
    }
    // Hands joined pose detection
    else if (wristDistance < 50 && leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y) {
        feedbackText = "Anjali Mudra Detected";
    }
    // Hands raised up vertically detection
    else if (leftWrist.y < leftShoulder.y - 100 && rightWrist.y < rightShoulder.y - 100) {
        feedbackText = "Hands Raised Up Pose detected!";
    }
    else {
        feedbackText = "";
    }
}

function draw() {
    // Resize the capture to match the canvas size
    image(capture, 0, 0, width, height); // Adjust this line if not already set correctly

    if (singlePose) {
        // Draw keypoints
        singlePose.keypoints.forEach(keypoint => {
            if (keypoint.score > 0.6) { // Only draw keypoints with good confidence
                fill(255, 0, 0);
                noStroke();
                ellipse(keypoint.position.x * (width / capture.width), 
                        keypoint.position.y * (height / capture.height), 
                        20, 20); // Increased ellipse size to 20 for more thickness
            }
        });

        // Draw skeleton
        skeleton.forEach(bone => {
            let [a, b] = bone;
            if (a.score > 0.6 && b.score > 0.6) { // Only draw skeleton lines with good confidence
                stroke(255, 255, 255);
                strokeWeight(8); // Increased thickness of skeleton lines to 8
                line(a.position.x * (width / capture.width), a.position.y * (height / capture.height),
                     b.position.x * (width / capture.width), b.position.y * (height / capture.height));
            }
        });

         // Detect meditation pose (hands together)
         let leftWrist = singlePose.leftWrist;
         let rightWrist = singlePose.rightWrist;
 
         if (leftWrist && rightWrist && leftWrist.confidence > 0.6 && rightWrist.confidence > 0.6) {
             let wristDistance = dist(leftWrist.x, leftWrist.y, rightWrist.x, rightWrist.y);
 
             // Check if the wrists are close enough to indicate hands joined together
             if (wristDistance < 50) { // Adjust this threshold as needed
                 feedbackText = 'Meditation Pose Detected';
             } else {
                 feedbackText = '';
             }
         }
        // Display feedback text
        fill(255);
        noStroke();
        textSize(40);
        text(feedbackText, 10, 30);
    }
}

