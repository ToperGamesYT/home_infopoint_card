# Home.InfoPoint Card

Custom Lovelace card for Home Assistant integration with **Home.InfoPoint**.
Displays grades, averages, and absence information for students.

## Features

- **Grades Table**: Displays subjects, current averages, and recent grades history.
- **Color Coded**: Grades are color-coded based on value (Green < 2.5, Yellow < 3.5, Orange < 4.0, Red >= 4.0).
- **Absences**: Shows summary chips for total absent days and unexcused absences at the top.
- **History**: Hover over historical grades to see dates and comments.
- **Responsive**: Clean, table-based layout.

## Installation


1. Add this repository to HACS
2. Install

## Configuration

Add the card to your dashboard view:

```yaml
type: custom:home-infopoint-card
```

## Requirements

This card requires sensors created by the [Home.InfoPoint integration](https://github.com/ToperGamesYT/home-infopoint):
- `sensor.home_infopoint_absences_days`
- `sensor.home_infopoint_unexcused_absences_days`
- `sensor.home_infopoint_last_update`
- Individual subject sensors starting with `sensor.home_infopoint_` containing `latest_grade_value` attribute.
