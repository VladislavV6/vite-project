import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    useCreateSupportTicketMutation,
    useGetUserTicketsQuery,
    useGetAllTicketsQuery,
    useGetTicketDetailsQuery,
    useAddTicketReplyMutation,
    useUpdateTicketStatusMutation
} from '../store/slices/apiSlice';
import {
    setTickets,
    setActiveTicket,
    updateNewTicket,
    resetNewTicket,
    setReplyMessage,
    updateTicketStatus
} from '../store/slices/supportSlice';
import "./style.css";

function SupportPage() {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const {
        tickets,
        activeTicket,
        newTicket,
        replyMessage
    } = useSelector(state => state.support);

    const [isLoading, setIsLoading] = useState(false);
    const [localReplies, setLocalReplies] = useState([]);
    const pendingReplies = useRef(new Set());
    const isSending = useRef(false);
    const lastActiveTicket = useRef(null);

    // Запросы данных с защитой от бесконечных циклов
    const { data: userTickets = [], refetch: refetchUserTickets } = useGetUserTicketsQuery(user?.user_id, {
        skip: !user?.user_id
    });

    const { data: allTickets = [], refetch: refetchAllTickets } = useGetAllTicketsQuery(undefined, {
        skip: !user || user?.role_id !== 1,
        selectFromResult: ({ data }) => ({
            data: data?.filter(ticket => ticket.status !== 'resolved') || []
        })
    });

    const { data: ticketDetails, refetch: refetchTicketDetails } = useGetTicketDetailsQuery(activeTicket, {
        skip: !activeTicket,
        refetchOnMountOrArgChange: true
    });

    const [createTicket] = useCreateSupportTicketMutation();
    const [addReply, { isLoading: isReplying }] = useAddTicketReplyMutation();
    const [updateStatus] = useUpdateTicketStatusMutation();

    // Стабильный обработчик выбора тикета
    const handleSelectTicket = useCallback((ticketId) => {
        if (activeTicket !== ticketId) {
            dispatch(setActiveTicket(ticketId));
            setIsLoading(true);
            setLocalReplies([]);
            pendingReplies.current.clear();
        }
    }, [activeTicket, dispatch]);

    // Загрузка тикетов с защитой от циклов
    useEffect(() => {
        const loadedTickets = user?.role_id === 1 ? allTickets : userTickets;

        // Проверяем, действительно ли нужно обновлять tickets
        if (JSON.stringify(loadedTickets) !== JSON.stringify(tickets)) {
            dispatch(setTickets(loadedTickets));

            // Выбираем первый тикет, если нет активного
            if (!activeTicket && loadedTickets[0] && loadedTickets[0].ticket_id !== lastActiveTicket.current) {
                lastActiveTicket.current = loadedTickets[0].ticket_id;
                dispatch(setActiveTicket(loadedTickets[0].ticket_id));
            }
        }
    }, [user, userTickets, allTickets, dispatch, tickets, activeTicket]);

    // Синхронизация сообщений с защитой от циклов
    useEffect(() => {
        if (!ticketDetails?.replies || !activeTicket) return;

        const serverReplies = ticketDetails.replies || [];
        setLocalReplies(prevReplies => {
            const newServerReplies = serverReplies.filter(reply =>
                !pendingReplies.current.has(reply.reply_id)
            );

            const filteredLocalReplies = prevReplies.filter(localReply =>
                localReply.reply_id && pendingReplies.current.has(localReply.reply_id)
            );

            const newReplies = [...newServerReplies, ...filteredLocalReplies];

            // Проверяем, действительно ли нужно обновлять
            return JSON.stringify(newReplies) !== JSON.stringify(prevReplies) ? newReplies : prevReplies;
        });

        setIsLoading(false);
    }, [ticketDetails, activeTicket]);

    const handleCreateTicket = async () => {
        if (!newTicket.subject || !newTicket.message) {
            alert('Заполните все обязательные поля');
            return;
        }

        try {
            await createTicket({
                user_id: user.user_id,
                order_id: newTicket.order_id || null,
                subject: newTicket.subject,
                message: newTicket.message
            }).unwrap();

            dispatch(resetNewTicket());
            await refetchUserTickets();
        } catch (err) {
            console.error('Ошибка при создании тикета:', err);
        }
    };

    const handleAddReply = async () => {
        const activeTicketData = tickets.find(t => t.ticket_id === activeTicket);
        if (!replyMessage || !activeTicket || !user?.user_id || isSending.current ||
            activeTicketData?.status === 'resolved') return;

        const tempReplyId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const tempReply = {
            reply_id: tempReplyId,
            ticket_id: activeTicket,
            user_id: user.user_id,
            user_name: user.name,
            user_role: user.role_id,
            message: replyMessage,
            created_at: new Date().toISOString()
        };

        isSending.current = true;
        pendingReplies.current.add(tempReplyId);

        try {
            dispatch(setReplyMessage(''));
            setLocalReplies(prev => [...prev, tempReply]);

            await addReply({
                ticket_id: activeTicket,
                user_id: user.user_id,
                message: replyMessage
            }).unwrap();

            await refetchTicketDetails();
        } catch (err) {
            console.error('Ошибка отправки:', err);
            setLocalReplies(prev => prev.filter(r => r.reply_id !== tempReplyId));
            dispatch(setReplyMessage(replyMessage));
        } finally {
            pendingReplies.current.delete(tempReplyId);
            isSending.current = false;
        }
    };

    const handleUpdateStatus = async (status) => {
        try {
            await updateStatus({
                ticket_id: activeTicket,
                status
            }).unwrap();

            dispatch(updateTicketStatus({ ticketId: activeTicket, status }));

            if (user?.role_id === 1) {
                await refetchAllTickets();
                if (status === 'resolved') {
                    dispatch(setActiveTicket(null));
                }
            } else {
                await refetchUserTickets();
            }
        } catch (err) {
            console.error('Ошибка при обновлении статуса:', err);
        }
    };

    const activeTicketData = activeTicket ? tickets.find(t => t.ticket_id === activeTicket) : null;
    const allReplies = localReplies;
    const isTicketResolved = activeTicketData?.status === 'resolved';
    const isAdmin = user?.role_id === 1;

    return (
        <div className="support-page">
            <header className="support-header">
                <h1>Техническая поддержка</h1>
                <p>{isAdmin ? 'Все обращения пользователей' : 'Ваши обращения в поддержку'}</p>
            </header>

            <div className="support-layout">
                <div className="tickets-list">
                    <h2>{isAdmin ? 'Все обращения' : 'Ваши обращения'}</h2>
                    {tickets?.length > 0 ? (
                        <div className="tickets-container">
                            {tickets.map(ticket => (
                                <div
                                    key={`ticket-${ticket.ticket_id}`}
                                    className={`ticket-card ${ticket.ticket_id === activeTicket ? 'active' : ''}`}
                                    onClick={() => handleSelectTicket(ticket.ticket_id)}
                                >
                                    <div className="ticket-header">
                                        <span className="ticket-id">#{ticket.ticket_id}</span>
                                        <span className={`ticket-status ${ticket.status}`}>
                                            {ticket.status === 'open' ? 'Открыт' :
                                                ticket.status === 'in_progress' ? 'В работе' : 'Решен'}
                                        </span>
                                    </div>
                                    <h3 className="ticket-subject">{ticket.subject}</h3>
                                    <p className="ticket-date">
                                        {new Date(ticket.created_at).toLocaleString('ru-RU')}
                                    </p>
                                    {ticket.order_number && (
                                        <p className="ticket-order">Заказ #{ticket.order_number}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-tickets">
                            <p>{isAdmin ? 'Нет активных обращений' : 'У вас пока нет обращений в поддержку'}</p>
                        </div>
                    )}
                </div>

                <div className="ticket-details">
                    {isLoading ? (
                        <div className="loading">Загрузка...</div>
                    ) : activeTicketData ? (
                        <>
                            <div className="ticket-info">
                                <h2>{activeTicketData.subject}</h2>
                                <div className="ticket-meta">
                                    <span className="ticket-id">#{activeTicketData.ticket_id}</span>
                                    <span className={`ticket-status ${activeTicketData.status}`}>
                                        {activeTicketData.status === 'open' ? 'Открыт' :
                                            activeTicketData.status === 'in_progress' ? 'В работе' : 'Решен'}
                                    </span>
                                    {activeTicketData.order_number && (
                                        <span className="ticket-order">Заказ #{activeTicketData.order_number}</span>
                                    )}
                                </div>
                                <p className="ticket-date">
                                    Создано: {new Date(activeTicketData.created_at).toLocaleString('ru-RU')}
                                </p>
                                <div className="ticket-message">
                                    <p>{activeTicketData.message}</p>
                                </div>
                            </div>

                            <div className="chat-container">
                                <div className="messages-list">
                                    {allReplies.length > 0 ? (
                                        allReplies.map((reply) => (
                                            <div
                                                key={`reply-${reply.reply_id || Date.now()}`}
                                                className={`message ${reply.user_id === user?.user_id ? 'own' : 'other'}`}
                                            >
                                                <div className="message-header">
                                                    <span className="message-author">
                                                        {reply.user_name || 'Пользователь'}
                                                        {reply.user_role === 1 && ' (Администратор)'}
                                                    </span>
                                                    <span className="message-date">
                                                        {new Date(reply.created_at).toLocaleString('ru-RU')}
                                                    </span>
                                                </div>
                                                <div className="message-content">
                                                    <p>{reply.message}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-messages">Пока нет сообщений в чате</p>
                                    )}
                                </div>

                                {!isTicketResolved && (
                                    <div className="message-input">
                                        <textarea
                                            value={replyMessage}
                                            onChange={(e) => dispatch(setReplyMessage(e.target.value))}
                                            placeholder="Введите ваше сообщение..."
                                            rows="3"
                                            disabled={isReplying}
                                        />
                                        <button
                                            onClick={handleAddReply}
                                            disabled={!replyMessage || isReplying}
                                        >
                                            {isReplying ? 'Отправка...' : 'Отправить'}
                                        </button>
                                    </div>
                                )}

                                {isTicketResolved && (
                                    <div className="ticket-resolved-notice">
                                        <p>Тикет закрыт. Новые сообщения нельзя отправить.</p>
                                        {!isAdmin && (
                                            <button
                                                className="new-ticket-button"
                                                onClick={() => dispatch(setActiveTicket(null))}
                                            >
                                                Создать новый тикет
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {isAdmin && !isTicketResolved && (
                                <div className="ticket-actions">
                                    <h3>Действия администратора</h3>
                                    <div className="status-buttons">
                                        <button
                                            onClick={() => handleUpdateStatus('open')}
                                            disabled={activeTicketData.status === 'open'}
                                        >
                                            Открыть
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus('in_progress')}
                                            disabled={activeTicketData.status === 'in_progress'}
                                        >
                                            В работу
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus('resolved')}
                                        >
                                            Решить
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-ticket-selected">
                            {activeTicket ? (
                                <p>Загрузка деталей тикета...</p>
                            ) : (
                                <>
                                    <p>Выберите тикет для просмотра</p>
                                    {!isAdmin && (
                                        <button
                                            className="new-ticket-button"
                                            onClick={() => dispatch(setActiveTicket(null))}
                                        >
                                            Создать новый тикет
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {!activeTicket && !isAdmin && (
                    <div className="new-ticket-form">
                        <h2>Создать новое обращение</h2>
                        <div className="form-group">
                            <label>Номер заказа (если относится к заказу)</label>
                            <input
                                type="text"
                                value={newTicket.order_id || ''}
                                onChange={(e) => dispatch(updateNewTicket({order_id: e.target.value}))}
                                placeholder="Необязательно"
                            />
                        </div>
                        <div className="form-group">
                            <label>Тема обращения*</label>
                            <input
                                type="text"
                                value={newTicket.subject || ''}
                                onChange={(e) => dispatch(updateNewTicket({ subject: e.target.value }))}
                                placeholder="Кратко опишите проблему"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Описание проблемы*</label>
                            <textarea
                                value={newTicket.message || ''}
                                onChange={(e) => dispatch(updateNewTicket({ message: e.target.value }))}
                                placeholder="Подробно опишите вашу проблему"
                                rows="6"
                                required
                            />
                        </div>
                        <button onClick={handleCreateTicket}>Отправить в поддержку</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SupportPage;