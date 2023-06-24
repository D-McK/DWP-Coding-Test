import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException
    try {
      if (accountId <= 0) {
        throw new InvalidPurchaseException("Invalid Purchase ID");
      }

      const totalNumberOfTickets = ticketTypeRequests.reduce(
        (accum, curr) => accum + curr.getNoOfTickets(),
        0
      );
      if (totalNumberOfTickets > 20) {
        throw new InvalidPurchaseException(
          "Maximum ticket purchase is 20 or less"
        );
      }
      if (
        !ticketTypeRequests.some((ticketTypeRequest) => {
          return ticketTypeRequest.getTicketType() === "ADULT";
        })
      ) {
        throw new InvalidPurchaseException(
          "Purchase must include at least 1 adult ticket"
        );
      }

      let totalAmountToPay = 0;
      let totalSeatsToAllocate = 0;

      //Iterates through all the tickets with a price/seat and adds them to running totals
      ticketTypeRequests.forEach((ticketTypeRequest) => {
        if (ticketTypeRequest.getTicketType() === "ADULT") {
          const tickets = ticketTypeRequest.getNoOfTickets();
          totalAmountToPay += 20 * tickets;
          totalSeatsToAllocate += tickets;
        }
        if (ticketTypeRequest.getTicketType() === "CHILD") {
          const tickets = ticketTypeRequest.getNoOfTickets();
          totalAmountToPay += 10 * tickets;
          totalSeatsToAllocate += tickets;
        }
      });

      //Instantiates the payment/seat services and sends the requests
      const paymentService = new TicketPaymentService();
      const reservationService = new SeatReservationService();
      paymentService.makePayment(accountId, totalAmountToPay);
      reservationService.reserveSeat(accountId, totalSeatsToAllocate);

    } catch (error) {
      throw new InvalidPurchaseException(error);
    }
  }
}
