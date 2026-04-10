---
title: Arduino TFL arrival board
excerpt: Custom arrival board for your home.
layout: layouts/post.liquid
permalink: /blog/tfl/
---

Let me start by outlining a problem I had. I live in a very unique part of London. I live equidistant from 2 district line stations. This is not unique, the uniqueness comes from both stations being on separate branches of the district line which join when going eastbound. This means that every time I leave the house to go eastbound, I need to check which station to go to to arrive faster. This means walking down my road with my phone out frantically searching on google maps to find the faster route (just finding the directions isnt efficient as it normally sets your departure time a few minutes after your actual departure time). I appreciate this is a small problem, but I am fortunate enough to have the time and skills to solve it, so I gave it a go.

My solution was to build a TFL arrival board for my house using an arduino. Below is an account of how I did it.

Firstly, TFL has a brilliant free to use API, so step one was trying to decode the outputs from that.


```python
import requests

# Base URL of the API
url = "https://api.tfl.gov.uk/line/district/arrivals"
# Make a GET request to the API
try:
    response = requests.get(url)
    # Check if the request was successful
    response.raise_for_status()  # This will raise an HTTPError if the response was an unsuccessful status
except requests.exceptions.HTTPError as http_err:
    print(f"HTTP error occurred: {http_err}")  # Handle specific HTTP errors
except Exception as err:
    print(f"Other error occurred: {err}")  # Handle other types of exceptions
else:
    # Parse the JSON response
    data = response.json()
print(data[0])
```

```
{
	'$type': 'Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities', 'id': '-1390706519', 'operationType': 1, 'vehicleId': '037', 'naptanId': '940GZZLUHCH', 'stationName': 'Hornchurch Underground Station', 'lineId': 'district', 'lineName': 'District', 'platformName': 'Eastbound - Platform 2', 'direction': 'outbound', 'bearing': '', 'destinationNaptanId': '940GZZLUUPM', 'destinationName': 'Upminster Underground Station', 'timestamp': '2025-03-11T10:44:30.7159196Z', 'timeToStation': 646, 'currentLocation': 'Between Upney and Becontree', 'towards': 'Upminster', 'expectedArrival': '2025-03-11T10:55:16Z', 'timeToLive': '2025-03-11T10:55:16Z', 'modeName': 'tube', 'timing': {'$type': 'Tfl.Api.Presentation.Entities.PredictionTiming, Tfl.Api.Presentation.Entities', 'countdownServerAdjustment': '00:00:00', 'source': '0001-01-01T00:00:00', 'insert': '0001-01-01T00:00:00', 'read': '2025-03-11T10:45:23.277Z', 'sent': '2025-03-11T10:44:30Z', 'received': '0001-01-01T00:00:00'}
}
```

Great! now we have an output. So it looks like here we have 'currentLocation', 'platformName', 'destinationName' (important for lines with branches) and 'expectedArrival' which are important fields.

Lets decode what is going on here: This API response is predicting the arrival of a District Line train at Dagenham East (Eastbound, Platform 2). The train is currently past Plaistow, heading towards Upminster, and is expected to arrive at 09:37:41 UTC (≈19.6 minutes from the timestamp).

So this is great now we simply have to filter the response to only include the two stations of interest, then rank them by arrival time

```python
import pandas

# Select fields for the table
selected_fields = ['vehicleId', 'stationName', 'lineName', 'platformName', 'expectedArrival', 'towards']

# Create a list of rows with selected fields
table_data = [{field: item[field] for field in selected_fields} for item in data]

# Create a DataFrame from the table data
df = pd.DataFrame(table_data)

# Convert 'expectedArrival' to datetime
df['expectedArrival'] = pd.to_datetime(df['expectedArrival'])

# Filter DataFrame to include only specific stations
stations_of_interest = ["Gunnersbury Underground Station", 
                        "Chiswick Park Underground Station"
                        ]
df_filtered = df[df['stationName'].isin(stations_of_interest)]

print(df_filtered)
```

```
    vehicleId                        stationName  lineName  \
299       046  Chiswick Park Underground Station  District   
340       026  Chiswick Park Underground Station  District   
405       002    Gunnersbury Underground Station  District   
452       126  Chiswick Park Underground Station  District   
504       125  Chiswick Park Underground Station  District   

               platformName           expectedArrival          towards  
299  Eastbound - Platform 2 2025-03-11 10:48:46+00:00        Upminster  
340  Westbound - Platform 1 2025-03-11 10:49:46+00:00  Ealing Broadway  
405  Westbound - Platform 1 2025-03-11 10:53:15+00:00         Richmond  
452  Westbound - Platform 1 2025-03-11 10:58:16+00:00  Ealing Broadway  
504  Westbound - Platform 1 2025-03-11 10:46:46+00:00  Ealing Broadway
```

Ok now we have the stations we want to observe and the expected arrival time.

Next, we process the raw API response to sort the trains by arrival time and west vs east bound. Here's how we do it:

```python
# Sort DataFrame by 'expectedArrival'
df_filtered['is_eastbound'] = df_filtered['platformName'].str.contains('Eastbound', case=False)

# Sort with eastbound trains first, then by expectedArrival
df_sorted = df_filtered.sort_values(by=['is_eastbound', 'expectedArrival'], ascending=[False, True])

# Drop the helper column as it's no longer needed
df_sorted = df_sorted.drop(columns='is_eastbound')

df_sorted.loc[
    df_sorted['stationName'] == 'Gunnersbury Underground Station', 'stationName'
] = 'Gunnersbury'

df_sorted.loc[
    df_sorted['stationName'] == 'Chiswick Park Underground Station', 'stationName'
] = 'Chiswick Park'

print(df_sorted)
```

My goal is to have this code export to an LCD screen on my arduino. To do this I will need to write a function that will export the df in a way which can be decoded by an arduino. So in this example we are seperating left and right alignment with a comma and each new line is seperated with a '|'.


```python
from datetime import datetime, timedelta

def send_to_lcd(df):
    current_time = datetime.now(pytz.utc)
    lines_to_display = []
    lines_to_display.append('EASTBOUND,')
    show=True
    count= 1
    for _, row in df.iterrows():
        if show:
            if "Westbound" in row['platformName']:
                show=False
                lines_to_display.append('WESTBOUND,')
                count = 1
        station = row['stationName']

        arrival_time = row['expectedArrival']
        minutes_until = round((arrival_time - current_time).total_seconds() / 60)

        # Only show trains arriving in 5+ mins
        if minutes_until > 0:
            display_line = f"{count} {station[:14]},{minutes_until}min"
            lines_to_display.append(display_line)
            count+=1

    # Combine lines with a '|' delimiter and end with newline
    message = "|".join(lines_to_display)[:200] + "\n"
    #ser.write(message.encode('utf-8'))
    print(message)

send_to_lcd(df_sorted)
```

```
EASTBOUND,|WESTBOUND,|1 Gunnersbury,1min|2 Chiswick Park,4min|3 Gunnersbury,6min|4 Chiswick Park,8min
```


So that is a pretty good place to be, next steps will be wiring up the LCD to the arduino and builidng a .ino file for building the image correctly.

First the arduino environment is set up.

The london underground font was taken from an excellent resource from /link{GitHub, https://github.com/petykowski/London-Underground-Dot-Matrix-Typeface },. This font was transformed from the .svg to the .h needed by the /link{adafruit package, https://github.com/adafruit/Adafruit-GFX-Library } by using this font convert. The pins are dependant on your own setup, but these pins will work for the wiring diagram in this blog.


```c++
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>

// Include the correct font
#include "LondonUnderground12pt7b.h"

// LCD pins
#define TFT_CS 10
#define TFT_RST 9
#define TFT_DC 8

Adafruit_ILI9341 tft = Adafruit_ILI9341(TFT_CS, TFT_DC, TFT_RST);

String incomingData = "";

void setup() {
  Serial.begin(9600);
  tft.begin();
  tft.setRotation(3);
  tft.setFont(&LondonUndergroundRegular8pt7b);
  tft.fillScreen(ILI9341_BLACK);
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(1);
  tft.setCursor(10, 18);
  tft.println("Waiting for data...");
}

void loop() {
  // Read full message until newline
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\n') {
      displayData(incomingData);
      incomingData = "";
    } else {
      incomingData += c;
    }
  }
}

void displayData(String data) {
  // Clear screen once
  tft.fillScreen(ILI9341_BLACK);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setFont(&LondonUndergroundRegular8pt7b);
  tft.setTextSize(1);

  int yPosition = 18;

  // Split the message using '|'
  int startIndex = 0;
  int delimiterIndex = data.indexOf('|');

  while (delimiterIndex != -1) {
    String line = data.substring(startIndex, delimiterIndex);

    // Find space between station and time
    int separatorIndex = line.lastIndexOf(',');
    
    if (separatorIndex != -1) {
      String station = line.substring(0, separatorIndex);
      String timeStr = line.substring(separatorIndex + 1);

      // Calculate width dynamically for right alignment
      int timeWidth = timeStr.length() * 10; // Adjust based on font
      int xPosition = 320 - timeWidth - 8; // Right-align with 10px margin

      // Print station name on the left
      tft.setCursor(10, yPosition);
      tft.print(station);
      
      // Print time aligned to the right
      tft.setCursor(xPosition, yPosition);
      tft.print(timeStr);
    }

    yPosition += 25;
    startIndex = delimiterIndex + 1;
    delimiterIndex = data.indexOf('|', startIndex);

    // Prevent text overflow
    if (yPosition > 300) break;
  }
}
```
Next, the output from the serial is decoded to look like a traditional london underground arrivals board. Finally load this .ino file on the arduino and un comment the line in the send to LCD function. 

You will need to find out which port the arduino is connected to this can be done with running ls /dev/tty* in your terminal. the arduino will be called something with USB. Once you have the port name adjust the following  code and add it to the top of the python project. This will mean the output is being sent to the arduino via the COM port.

```python
import serial
ser = serial.Serial('/dev/tty.usbmodemxxxx', 9600, timeout=1)  # Adjust '/dev/tty.usbmodemxxx'
```

The next step is to add a wifi module and containerise the code so the project can run autonomously.

This will be posted in the repo on github as it runs fully on cpp code.


