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

1. Copy `home-infopoint-card.js` to your `config/www/community/home_infopoint_card/` directory.
2. Add the resource to your Lovelace configuration:
   
   ```yaml
   resources:
     - url: /hacsfiles/home_infopoint_card/home-infopoint-card.js
       type: module
   ```
   *(Note: Adjust the URL if you are not using HACS or have a different path structure, e.g., `/local/community/home_infopoint_card/home-infopoint-card.js`)*

## Configuration

Add the card to your dashboard view:

```yaml
type: custom:home-infopoint-card
```

## Requirements

This card requires sensors created by the Home.InfoPoint integration:
- `sensor.home_infopoint_absences_days`
- `sensor.home_infopoint_unexcused_absences_days`
- `sensor.home_infopoint_last_update`
- Individual subject sensors starting with `sensor.home_infopoint_` containing `latest_grade_value` attribute.
