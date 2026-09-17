export const data = [
    {
        "id":"1",
        "time":"20:00",
        "type":"time",
    },
    {
        "id":"2",
        "time":"20:30",
        "type":"time",
    },
    {
        "id":"3",
        "time":"21:00",
        "type":"time",
    },
    {
        "id":"4",
        "time":"21:30",
        "type":"time",
    },
    {
        "id":"5",
        "time":"22:00",
        "type":"time",
    },
    {
        "id":"6",
        "time":"22:30",
        "type":"time",
    },
    {
        "id":"7",
        "time":"23:00",
        "type":"time",
    },
    {
        "id": "8",
        "guests":"1",
        "type":"guest_vol"
    },
    {
        "id": "9",
        "guests":"2",
        "type":"guest_vol"
    },
    {
        "id": "10",
        "guests":"3",
        "type":"guest_vol"
    },
    {
        "id": "11",
        "guests":"4",
        "type":"guest_vol"
    },
]

export const timeOptions = data.filter((el) => el.type === 'time');
export const guestOptions = data.filter((el) => el.type === 'guest_vol');
