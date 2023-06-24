import TicketService from "../src/pairtest/TicketService";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";
import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException";
import SeatReservationService from "../src/thirdparty/seatbooking/SeatReservationService";
import TicketPaymentService from "../src/thirdparty/paymentgateway/TicketPaymentService";

describe("TicketService", () => {
  let ticketService;
  let accountId;

  beforeEach(() => {
    ticketService = new TicketService();
    accountId = 1;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should throw an InvalidPurchaseException when the id is not greater than 0", () => {
    const ticketRequest = new TicketTypeRequest("ADULT", 1);
    accountId = 0;

    expect(() => {
      ticketService.purchaseTickets(accountId, ticketRequest);
    }).toThrow(InvalidPurchaseException);
  });

  it("should throw an InvalidPurchaseException when the number of tickets purchased is more than 20", () => {
    const ticketRequest1 = new TicketTypeRequest("ADULT", 15);
    const ticketRequest2 = new TicketTypeRequest("CHILD", 10);

    expect(() => {
      ticketService.purchaseTickets(accountId, ticketRequest1, ticketRequest2);
    }).toThrow(InvalidPurchaseException);
  });

  it("should throw an InvalidPurchaseException when the purchase does not include at least 1 adult ticket", () => {
    const ticketRequest = new TicketTypeRequest("CHILD", 5);

    expect(() => {
      ticketService.purchaseTickets(accountId, ticketRequest);
    }).toThrow(InvalidPurchaseException);
  });

  it("should make payment and reserve seats when valid ticket requests are made", () => {
    const ticketRequest1 = new TicketTypeRequest("ADULT", 3);
    const ticketRequest2 = new TicketTypeRequest("CHILD", 2);

    const paymentServiceMock = jest.spyOn(
      TicketPaymentService.prototype,
      "makePayment"
    );
    const reservationServiceMock = jest.spyOn(
      SeatReservationService.prototype,
      "reserveSeat"
    );

    ticketService.purchaseTickets(accountId, ticketRequest1, ticketRequest2);

    expect(paymentServiceMock).toHaveBeenCalledWith(accountId, 80);
    expect(reservationServiceMock).toHaveBeenCalledWith(accountId, 5);
  });
});
