import math
import datetime

def prayer_times(date):
    # A simplified mock astronomical calculation for Alexandria
    # True adhan calculation requires full astronomical equations.
    # We provide a static offset based on date for demonstration of local calculation.
    day_of_year = date.timetuple().tm_yday

    # Alexandria coordinates: 31.2001, 29.9187
    # For a genuine offline app, a library like `prayertimes` algorithm is used.
    # Here is a deterministic approximation for Alexandria.

    base_fajr = datetime.timedelta(hours=4, minutes=30)
    base_dhuhr = datetime.timedelta(hours=11, minutes=55)
    base_asr = datetime.timedelta(hours=15, minutes=30)
    base_maghrib = datetime.timedelta(hours=18, minutes=45)
    base_isha = datetime.timedelta(hours=20, minutes=10)

    offset_minutes = int(math.sin(day_of_year / 365.0 * 2 * math.pi) * 30)
    offset = datetime.timedelta(minutes=offset_minutes)

    fajr = (datetime.datetime(date.year, date.month, date.day) + base_fajr - offset).time()
    dhuhr = (datetime.datetime(date.year, date.month, date.day) + base_dhuhr).time()
    asr = (datetime.datetime(date.year, date.month, date.day) + base_asr + offset/2).time()
    maghrib = (datetime.datetime(date.year, date.month, date.day) + base_maghrib + offset).time()
    isha = (datetime.datetime(date.year, date.month, date.day) + base_isha + offset).time()

    return {
        'fajr': fajr.strftime("%I:%M %p"),
        'dhuhr': dhuhr.strftime("%I:%M %p"),
        'asr': asr.strftime("%I:%M %p"),
        'maghrib': maghrib.strftime("%I:%M %p"),
        'isha': isha.strftime("%I:%M %p")
    }

if __name__ == "__main__":
    today = datetime.date.today()
    times = prayer_times(today)
    print(f"Prayer times for Alexandria on {today}:")
    for name, time_str in times.items():
        print(f"{name.capitalize():<8}: {time_str}")