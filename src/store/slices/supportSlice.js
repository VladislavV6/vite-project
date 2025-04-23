import { createSlice } from '@reduxjs/toolkit';

const supportSlice = createSlice({
    name: 'support',
    initialState: {
        tickets: [],
        activeTicket: null,
        newTicket: {
            order_id: '',
            subject: '',
            message: ''
        },
        replyMessage: ''
    },
    reducers: {
        setTickets: (state, action) => {
            state.tickets = action.payload;
        },
        setActiveTicket: (state, action) => {
            state.activeTicket = action.payload;
        },
        updateNewTicket: (state, action) => {
            state.newTicket = { ...state.newTicket, ...action.payload };
        },
        resetNewTicket: (state) => {
            state.newTicket = {
                order_id: '',
                subject: '',
                message: ''
            };
        },
        setReplyMessage: (state, action) => {
            state.replyMessage = action.payload;
        },
        addReplyToTicket: (state, action) => {
            if (state.activeTicket) {
                const ticket = state.tickets.find(t => t.ticket_id === state.activeTicket);
                if (ticket) {
                    ticket.replies = ticket.replies || [];
                    ticket.replies.push(action.payload);
                }
            }
        },
        updateTicketStatus: (state, action) => {
            const { ticketId, status } = action.payload;
            const ticket = state.tickets.find(t => t.ticket_id === ticketId);
            if (ticket) {
                ticket.status = status;
            }
        }
    }
});

export const {
    setTickets,
    setActiveTicket,
    updateNewTicket,
    resetNewTicket,
    setReplyMessage,
    addReplyToTicket,
    updateTicketStatus
} = supportSlice.actions;

export default supportSlice.reducer;