"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMessageWrite = exports.onOrderDeleted = exports.onOrderCreated = exports.onProductDeleted = exports.onProductCreated = exports.onUserDeleted = exports.onUserCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const app_1 = require("firebase-admin/app");
const firestore_2 = require("firebase-admin/firestore");
(0, app_1.initializeApp)();
const db = (0, firestore_2.getFirestore)();
// --- Distributed Counters ---
const updateCounter = async (field, change) => {
    const statsRef = db.doc('stats/general');
    await statsRef.set({ [field]: firestore_2.FieldValue.increment(change) }, { merge: true });
};
// Users Counter
exports.onUserCreated = (0, firestore_1.onDocumentCreated)('users/{userId}', (event) => {
    return updateCounter('totalUsers', 1);
});
exports.onUserDeleted = (0, firestore_1.onDocumentDeleted)('users/{userId}', (event) => {
    return updateCounter('totalUsers', -1);
});
// Products Counter
exports.onProductCreated = (0, firestore_1.onDocumentCreated)('products/{productId}', (event) => {
    return updateCounter('totalProducts', 1);
});
exports.onProductDeleted = (0, firestore_1.onDocumentDeleted)('products/{productId}', (event) => {
    return updateCounter('totalProducts', -1);
});
// Orders Counter
exports.onOrderCreated = (0, firestore_1.onDocumentCreated)('orders/{orderId}', (event) => {
    return updateCounter('totalSales', 1);
});
exports.onOrderDeleted = (0, firestore_1.onDocumentDeleted)('orders/{orderId}', (event) => {
    return updateCounter('totalSales', -1);
});
// --- Existing Triggers ---
// Dispara quando há escrita em conversations/{conversationId}/messages/{messageId}
exports.onMessageWrite = (0, firestore_1.onDocumentWritten)('conversations/{conversationId}/messages/{messageId}', async (event) => {
    const conversationId = event.params.conversationId;
    const after = event.data?.after;
    if (!after)
        return;
    const newMessage = after.data();
    try {
        // Ler conversa para obter destinatário
        const convoSnap = await db.doc(`conversations/${conversationId}`).get();
        if (!convoSnap.exists)
            return;
        const convo = convoSnap.data();
        const participants = convo.participantIds || [];
        const receiverId = participants.find((p) => p !== newMessage.senderId);
        if (!receiverId)
            return;
        // Criar notificação
        await db.collection('notifications').add({
            userId: receiverId,
            message: newMessage.text || 'Nova mensagem recebida',
            link: `/inbox/${conversationId}`,
            read: false,
            createdAt: firestore_2.Timestamp.now(),
        });
    }
    catch (err) {
        console.error('Erro ao criar notificação:', err);
    }
});
