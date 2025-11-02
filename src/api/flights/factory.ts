// ==================== TYPES & INTERFACES ====================

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout } from "node:timers/promises";

interface Airport {
    code: string;
    name: string;
    city: string;
    country: string;
    timezone: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
}

interface Airline {
    code: string;
    name: string;
    logo: string;
    rating: number;
}

interface Aircraft {
    model: string;
    manufacturer: string;
    capacity: number;
    configuration: {
        economy: number;
        premiumEconomy: number;
        business: number;
        first: number;
    };
}

type CabinClass = "economy" | "premium-economy" | "business" | "first";
type FlightStatus =
    | "scheduled"
    | "boarding"
    | "departed"
    | "in-flight"
    | "landed"
    | "delayed"
    | "cancelled";
type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
type PassengerType = "adult" | "child" | "infant";

interface FlightSegment {
    id: string;
    flightNumber: string;
    airline: Airline;
    aircraft: Aircraft;
    departure: {
        airport: Airport;
        dateTime: string;
        terminal?: string;
        gate?: string;
    };
    arrival: {
        airport: Airport;
        dateTime: string;
        terminal?: string;
        gate?: string;
    };
    duration: number; // in minutes
    status: FlightStatus;
    availableSeats: Record<CabinClass, number>;
    amenities: Array<string>;
}

interface Flight {
    id: string;
    segments: Array<FlightSegment>;
    totalDuration: number;
    stops: number;
    prices: Record<CabinClass, number>;
    baggageAllowance: {
        cabin: {
            weight: number;
            pieces: number;
        };
        checked: {
            weight: number;
            pieces: number;
        };
    };
    refundable: boolean;
    changeable: boolean;
}

interface Passenger {
    id: string;
    type: PassengerType;
    title: "Mr" | "Ms" | "Mrs" | "Dr";
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber?: string;
    passportExpiry?: string;
    email?: string;
    phone?: string;
    frequentFlyerNumber?: string;
    specialRequests?: Array<string>;
}

interface Seat {
    id: string;
    row: number;
    column: string;
    class: CabinClass;
    type: "window" | "middle" | "aisle";
    features: Array<string>;
    available: boolean;
    price: number;
}

interface Payment {
    id: string;
    method: "credit-card" | "debit-card" | "paypal" | "bank-transfer";
    amount: number;
    currency: string;
    status: "pending" | "completed" | "failed" | "refunded";
    timestamp: string;
    transactionId: string;
}

interface Booking {
    id: string;
    bookingReference: string;
    flight: Flight;
    passengers: Array<Passenger>;
    seatAssignments: Record<string, Array<Seat>>; // passengerId -> seats for each segment
    totalPrice: number;
    currency: string;
    status: BookingStatus;
    payment?: Payment;
    createdAt: string;
    updatedAt: string;
    contactInfo: {
        email: string;
        phone: string;
    };
    addOns: {
        extraBaggage?: number;
        meals?: Array<string>;
        insurance?: boolean;
        priorityBoarding?: boolean;
    };
}

interface SearchParams {
    origin: string;
    destination: string;
    departureDate?: string;
    returnDate?: string;
    passengers: {
        adults: number;
        children: number;
        infants: number;
    };
    cabinClass: CabinClass;
    directOnly?: boolean;
    maxStops?: number;
    preferredAirlines?: Array<string>;
}

// ==================== MOCK DATA ====================

const mockAirports: Array<Airport> = [
    {
        code: "JFK",
        name: "John F. Kennedy International Airport",
        city: "New York",
        country: "United States",
        timezone: "America/New_York",
        coordinates: { latitude: 40.6413, longitude: -73.7781 },
    },
    {
        code: "LAX",
        name: "Los Angeles International Airport",
        city: "Los Angeles",
        country: "United States",
        timezone: "America/Los_Angeles",
        coordinates: { latitude: 33.9416, longitude: -118.4085 },
    },
    {
        code: "LHR",
        name: "London Heathrow Airport",
        city: "London",
        country: "United Kingdom",
        timezone: "Europe/London",
        coordinates: { latitude: 51.47, longitude: -0.4543 },
    },
    {
        code: "CDG",
        name: "Charles de Gaulle Airport",
        city: "Paris",
        country: "France",
        timezone: "Europe/Paris",
        coordinates: { latitude: 49.0097, longitude: 2.5479 },
    },
    {
        code: "DXB",
        name: "Dubai International Airport",
        city: "Dubai",
        country: "United Arab Emirates",
        timezone: "Asia/Dubai",
        coordinates: { latitude: 25.2532, longitude: 55.3657 },
    },
    {
        code: "NRT",
        name: "Narita International Airport",
        city: "Tokyo",
        country: "Japan",
        timezone: "Asia/Tokyo",
        coordinates: { latitude: 35.7647, longitude: 140.3864 },
    },
];

const mockAirlines: Array<Airline> = [
    { code: "AA", name: "American Airlines", logo: "🛫", rating: 4.2 },
    { code: "BA", name: "British Airways", logo: "✈️", rating: 4.5 },
    { code: "EK", name: "Emirates", logo: "🦅", rating: 4.8 },
    { code: "UA", name: "United Airlines", logo: "🌐", rating: 4.1 },
    { code: "LH", name: "Lufthansa", logo: "🦅", rating: 4.6 },
    { code: "AF", name: "Air France", logo: "🇫🇷", rating: 4.4 },
];

const mockAircraft: Array<Aircraft> = [
    {
        model: "Boeing 787-9",
        manufacturer: "Boeing",
        capacity: 296,
        configuration: {
            economy: 224,
            premiumEconomy: 48,
            business: 24,
            first: 0,
        },
    },
    {
        model: "Airbus A350-900",
        manufacturer: "Airbus",
        capacity: 325,
        configuration: {
            economy: 250,
            premiumEconomy: 40,
            business: 30,
            first: 5,
        },
    },
    {
        model: "Boeing 777-300ER",
        manufacturer: "Boeing",
        capacity: 396,
        configuration: {
            economy: 310,
            premiumEconomy: 44,
            business: 34,
            first: 8,
        },
    },
];

// ==================== MOCK API FUNCTIONS ====================

class FlightBookingAPI {
    private filename = "flights.json";
    private flights: Array<Flight> = [];
    private bookings: Map<string, Booking> = new Map();

    constructor() {
        this.readData().then((data) => {
            if (data) {
                this.flights = data.flights;
                this.bookings = new Map(data.bookings.map((b) => [b.id, b]));
            } else {
                this.initializeMockData();
                this.writeData();
            }
        });
    }

    private async readData() {
        try {
            const filePath = path.join(process.cwd(), this.filename);
            const data = await readFile(filePath, "utf8");
            const jsonData = JSON.parse(data);
            return jsonData as {
                flights: Array<Flight>;
                bookings: Array<Booking>;
            };
        } catch (error) {
            console.error("Error reading JSON file:", error);
            return null;
        }
    }

    private async writeData() {
        try {
            const filePath = path.join(process.cwd(), this.filename);
            const jsonString = JSON.stringify(
                {
                    flights: this.flights,
                    bookings: Array.from(this.bookings.values()),
                },
                null,
                2,
            );
            await writeFile(filePath, jsonString, "utf8");
            console.log("JSON file written successfully.");
        } catch (error) {
            console.error("Error writing JSON file:", error);
        }
    }

    private initializeMockData(): void {
        // Generate sample flights
        for (let i = 0; i < 100; i++) {
            this.flights.push(this.generateMockFlight(i));
        }
    }

    private calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ): number {
        // Haversine formula to calculate distance in km
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private calculateFlightDuration(distance: number): number {
        // Average flight speed: 800 km/h, plus 30-45 min for taxi/takeoff/landing
        const flightTime = (distance / 800) * 60; // in minutes
        const groundTime = 30 + Math.random() * 15;
        const randomVariation = (Math.random() - 0.5) * 20; // ±10 minutes
        return Math.round(flightTime + groundTime + randomVariation);
    }

    private calculatePrice(
        distance: number,
        departureDate: Date,
        airlineRating: number,
    ): number {
        // Base price: $0.15 per km
        const distancePrice = distance * 0.15;

        // Date-based pricing: higher prices closer to departure
        const daysUntilFlight = Math.floor(
            (departureDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        let dateMultiplier = 1;
        if (daysUntilFlight < 3) dateMultiplier = 2.5;
        else if (daysUntilFlight < 7) dateMultiplier = 1.8;
        else if (daysUntilFlight < 14) dateMultiplier = 1.4;
        else if (daysUntilFlight < 30) dateMultiplier = 1.1;

        // Airline rating affects price
        const airlineMultiplier = 0.7 + (airlineRating / 5) * 0.6;

        // Random market variation ±20%
        const randomMultiplier = 0.8 + Math.random() * 0.4;

        return Math.round(
            distancePrice *
                dateMultiplier *
                airlineMultiplier *
                randomMultiplier,
        );
    }

    private generateMockFlight(index: number): Flight {
        const originIdx = index % mockAirports.length;
        const destIdx = (index + 1) % mockAirports.length;
        const airline = mockAirlines[index % mockAirlines.length];
        const aircraft = mockAircraft[index % mockAircraft.length];

        const origin = mockAirports[originIdx];
        const destination = mockAirports[destIdx];

        // Calculate distance and duration
        const distance = this.calculateDistance(
            origin.coordinates.latitude,
            origin.coordinates.longitude,
            destination.coordinates.latitude,
            destination.coordinates.longitude,
        );

        const departureTime = new Date();
        departureTime.setDate(departureTime.getDate() + Math.floor(index / 3));
        departureTime.setHours(8 + (index % 15), 0, 0);

        const duration = this.calculateFlightDuration(distance);
        const arrivalTime = new Date(
            departureTime.getTime() + duration * 60000,
        );

        const segment: FlightSegment = {
            id: `SEG-${index}`,
            flightNumber: `${airline.code}${1000 + index}`,
            airline,
            aircraft,
            departure: {
                airport: origin,
                dateTime: departureTime.toISOString(),
                terminal: `${Math.floor(Math.random() * 5) + 1}`,
                gate: `${String.fromCharCode(65 + Math.floor(Math.random() * 10))}${Math.floor(Math.random() * 20) + 1}`,
            },
            arrival: {
                airport: destination,
                dateTime: arrivalTime.toISOString(),
                terminal: `${Math.floor(Math.random() * 5) + 1}`,
                gate: `${String.fromCharCode(65 + Math.floor(Math.random() * 10))}${Math.floor(Math.random() * 20) + 1}`,
            },
            duration: duration,
            status: "scheduled",
            availableSeats: {
                economy:
                    aircraft.configuration.economy -
                    Math.floor(Math.random() * 50),
                "premium-economy":
                    aircraft.configuration.premiumEconomy -
                    Math.floor(Math.random() * 10),
                business:
                    aircraft.configuration.business -
                    Math.floor(Math.random() * 5),
                first:
                    aircraft.configuration.first -
                    Math.floor(Math.random() * 2),
            },
            amenities: [
                "WiFi",
                "Power Outlets",
                "Entertainment System",
                "Meal Service",
            ],
        };

        const basePrice = this.calculatePrice(
            distance,
            departureTime,
            airline.rating,
        );

        return {
            id: `FLT-${index}`,
            segments: [segment],
            totalDuration: Math.round(duration),
            stops: 0,
            prices: {
                economy: Math.round(basePrice),
                "premium-economy": Math.round(basePrice * 1.5),
                business: Math.round(basePrice * 3),
                first: Math.round(basePrice * 5),
            },
            baggageAllowance: {
                cabin: { weight: 10, pieces: 1 },
                checked: { weight: 23, pieces: 2 },
            },
            refundable: Math.random() > 0.5,
            changeable: true,
        };
    }

    // Search for flights
    async searchFlights(params: SearchParams) {
        await setTimeout(random(500, 1000));

        return this.flights.filter((flight) => {
            const segment = flight.segments[0];
            const matchesRoute =
                segment.departure.airport.code.toLowerCase() ===
                    params.origin.toLowerCase() &&
                segment.arrival.airport.code.toLowerCase() ===
                    params.destination.toLowerCase();

            const matchesDate = params.departureDate
                ? segment.departure.dateTime.startsWith(params.departureDate)
                : true;
            const matchesClass = segment.availableSeats[params.cabinClass] > 0;
            const matchesDirect = !params.directOnly || flight.stops === 0;

            return matchesRoute && matchesDate && matchesClass && matchesDirect;
        });
    }

    // Get flight details
    async getFlightDetails(flightId: string) {
        await setTimeout(random(150, 250));
        const flight = this.flights.find((f) => f.id === flightId);
        return flight || null;
    }

    // Get available seats for a flight segment
    async getAvailableSeats(segmentId: string, cabinClass: CabinClass) {
        await setTimeout(random(300, 500));
        const seats: Array<Seat> = [];
        const rows =
            cabinClass === "economy" ? 30 : cabinClass === "business" ? 8 : 4;
        const columns = ["A", "B", "C", "D", "E", "F"];

        for (let row = 1; row <= rows; row++) {
            for (const col of columns) {
                const isWindow = col === "A" || col === "F";
                const isAisle = col === "C" || col === "D";
                const seatType = isWindow
                    ? "window"
                    : isAisle
                      ? "aisle"
                      : "middle";

                seats.push({
                    id: `${segmentId}-${row}${col}`,
                    row,
                    column: col,
                    class: cabinClass,
                    type: seatType,
                    features: isWindow ? ["Extra legroom"] : [],
                    available: Math.random() > 0.3,
                    price:
                        seatType === "window" || seatType === "aisle" ? 25 : 15,
                });
            }
        }

        return seats;
    }

    // Create a booking
    async createBooking(
        flight: Flight,
        passengers: Array<Passenger>,
        cabinClass: CabinClass,
        contactInfo: { email: string; phone: string },
    ) {
        await setTimeout(random(400, 600));

        const bookingRef = `BK${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        const totalPassengers = passengers.length;
        const basePrice = flight.prices[cabinClass] * totalPassengers;

        const booking: Booking = {
            id: `BOOK-${Date.now()}`,
            bookingReference: bookingRef,
            flight,
            passengers,
            seatAssignments: {},
            totalPrice: basePrice,
            currency: "USD",
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            contactInfo,
            addOns: {},
        };

        this.bookings.set(booking.id, booking);
        this.writeData();
        return booking;
    }

    // Get booking details
    async getBooking(bookingId: string) {
        await setTimeout(random(200, 300));
        return this.bookings.get(bookingId) || null;
    }

    // Get booking by reference
    async getBookingByReference(reference: string) {
        await setTimeout(random(200, 300));
        const booking = Array.from(this.bookings.values()).find(
            (b) => b.bookingReference === reference,
        );
        return booking || null;
    }

    // Update booking
    async updateBooking(bookingId: string, updates: Partial<Booking>) {
        await setTimeout(random(300, 500));
        const booking = this.bookings.get(bookingId);
        if (!booking) {
            return null;
            return;
        }

        const updatedBooking = {
            ...booking,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        this.bookings.set(bookingId, updatedBooking);
        this.writeData();
        return updatedBooking;
    }

    // Process payment
    async processPayment(
        bookingId: string,
        paymentMethod: Payment["method"],
        amount: number,
    ) {
        await setTimeout(random(1000, 1500));

        const booking = this.bookings.get(bookingId);
        if (!booking) throw new Error("Booking not found");

        const payment: Payment = {
            id: `PAY-${Date.now()}`,
            method: paymentMethod,
            amount,
            currency: booking.currency,
            status: Math.random() > 0.1 ? "completed" : "failed",
            timestamp: new Date().toISOString(),
            transactionId: `TXN-${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
        };

        if (payment.status === "completed") {
            this.updateBooking(bookingId, {
                payment,
                status: "confirmed",
            });
            this.writeData();
        }

        return payment;
    }

    // Cancel booking
    async cancelBooking(bookingId: string): Promise<boolean> {
        await setTimeout(random(200, 300));
        const booking = this.bookings.get(bookingId);
        if (!booking) return true;

        this.updateBooking(bookingId, { status: "cancelled" });
        this.writeData();
        return true;
    }

    // Get popular destinations
    async getPopularDestinations(limit: number = 10) {
        await setTimeout(random(2500, 5000));
        return mockAirports.slice(0, limit);
    }

    // Get airlines
    async getAirlines() {
        await setTimeout(random(150, 250));
        return mockAirlines;
    }
}

// ==================== UTILS ====================

function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ==================== USAGE EXAMPLE ====================

const api = new FlightBookingAPI();

// Example: Search for flights
async function exampleUsage() {
    console.log("Searching for flights...");
    const flights = await api.searchFlights({
        origin: "CDG",
        destination: "DXB",
        departureDate: "2025-11-15",
        passengers: { adults: 2, children: 0, infants: 0 },
        cabinClass: "economy",
        directOnly: true,
    });

    console.log(`Found ${flights.length} flights`);

    if (flights.length > 0) {
        const flight = flights[0];
        console.log("\nFlight Details:", flight);

        // Create booking
        const passengers: Array<Passenger> = [
            {
                id: "P1",
                type: "adult",
                title: "Mr",
                firstName: "John",
                lastName: "Doe",
                dateOfBirth: "1990-01-01",
                nationality: "US",
                passportNumber: "US123456789",
                passportExpiry: "2030-01-01",
            },
        ];

        const booking = await api.createBooking(flight, passengers, "economy", {
            email: "john@example.com",
            phone: "+1234567890",
        });

        console.log("\nBooking created:", booking.bookingReference);

        // Process payment
        const payment = await api.processPayment(
            booking.id,
            "credit-card",
            booking.totalPrice,
        );

        console.log("\nPayment status:", payment.status);
    }
}

// Uncomment to run example
// exampleUsage();

export {
    FlightBookingAPI,
    type Booking,
    type Flight,
    type Passenger,
    type SearchParams,
};
