import { onDocumentWritten, onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

// --- Distributed Counters ---

const updateCounter = async (field: string, change: number) => {
    const statsRef = db.doc('stats/general');
    await statsRef.set({ [field]: FieldValue.increment(change) }, { merge: true });
};

// Users Counter
export const onUserCreated = onDocumentCreated('users/{userId}', (event) => {
    return updateCounter('totalUsers', 1);
});

export const onUserDeleted = onDocumentDeleted('users/{userId}', (event) => {
    return updateCounter('totalUsers', -1);
});

// Products Counter
export const onProductCreated = onDocumentCreated('products/{productId}', (event) => {
    return updateCounter('totalProducts', 1);
});

export const onProductDeleted = onDocumentDeleted('products/{productId}', (event) => {
    return updateCounter('totalProducts', -1);
});

// Orders Counter
export const onOrderCreated = onDocumentCreated('orders/{orderId}', (event) => {
    return updateCounter('totalSales', 1);
});

export const onOrderDeleted = onDocumentDeleted('orders/{orderId}', (event) => {
    return updateCounter('totalSales', -1);
});

// --- Existing Triggers ---

// Dispara quando há escrita em conversations/{conversationId}/messages/{messageId}
export const onMessageWrite = onDocumentWritten(
	'conversations/{conversationId}/messages/{messageId}',
	async (event) => {
		const conversationId = event.params.conversationId as string;
		const after = event.data?.after;
		if (!after) return;
		const newMessage = after.data() as { senderId: string; text?: string };

		try {
			// Ler conversa para obter destinatário
			const convoSnap = await db.doc(`conversations/${conversationId}`).get();
			if (!convoSnap.exists) return;
			const convo = convoSnap.data() as { participantIds: string[] };
			const participants = convo.participantIds || [];
			const receiverId = participants.find((p) => p !== newMessage.senderId);
			if (!receiverId) return;

			// Criar notificação
			await db.collection('notifications').add({
				userId: receiverId,
				message: newMessage.text || 'Nova mensagem recebida',
				link: `/inbox/${conversationId}`,
				read: false,
				createdAt: Timestamp.now(),
			});
		} catch (err) {
			console.error('Erro ao criar notificação:', err);
		}
	}
);