const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { logger } = functions;

exports.addMessage = functions.https.onCall(async (data, context) => {
  try {
    logger.log("Received message request data: ", data);

    if (!data.text || !data.userId) {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Required fields (text or userId) are missing",
      );
    }

    const { text, userId } = data;

    // construct message data
    const messageData = {
      text,
      userId,
      timetamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // add message to user's subcollection
    const messageRef = await admin
        .firestore()
        .collection("chats")
        .doc(userId)
        .collection("messages")
        .add(messageData);

    logger.log("Message added successfully, message ID: ", messageRef.id);
    return { status: "success", messageId: messageRef.id };
  } catch (error) {
    logger.error("Error adding message: ", error);
    throw new functions.https.HttpsError(
        "unknown",
        "An error occurred while adding the message",
        error.message,
    );
  }
});
