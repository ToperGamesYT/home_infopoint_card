class HomeInfoPointCard extends HTMLElement {
    setConfig(config) {
        this.config = config;
    }

    set hass(hass) {
        if (!this.content) {
            const card = document.createElement('ha-card');
            card.header = 'Home.InfoPoint';
            this.content = document.createElement('div');
            this.content.style.padding = '0 16px 16px';
            card.appendChild(this.content);
            this.appendChild(card);
        }

        // Find sensors
        const absencesDays = hass.states['sensor.home_infopoint_absences_days']?.state || '0';
        const unexcusedDays = hass.states['sensor.home_infopoint_unexcused_absences_days']?.state || '0';
        const lastUpdate = hass.states['sensor.home_infopoint_last_update']?.state || 'Unknown';

        // Filter Subjects (Dynamically find all sensors that have 'latest_grade_value' attribute)
        const allSensors = Object.keys(hass.states);
        const subjectSensors = allSensors.filter(id => {
            const s = hass.states[id];
            // Check if it belongs to our integration AND has the expected attribute
            return id.startsWith('sensor.home_infopoint_') &&
                s.attributes &&
                (s.attributes.latest_grade_value !== undefined || s.attributes.history !== undefined) &&
                !id.includes('absences') &&
                !id.includes('last_update');
        });

        const subjects = subjectSensors.map(id => {
            const s = hass.states[id];
            // Remove "Home.InfoPoint " prefix from friendly name for display
            const name = s.attributes.friendly_name ? s.attributes.friendly_name.replace('Home.InfoPoint ', '') : id;
            return {
                name: name,
                state: s.state,
                latest: s.attributes.latest_grade_value || '-',
                date: s.attributes.latest_grade_date || '',
                history: s.attributes.history || [],
                entity_id: id
            };
        }).sort((a, b) => a.name.localeCompare(b.name));

        // Render HTML Logic
        let absencesHtml = '';
        // Parse int to check if > 0
        const absDaysInt = parseInt(absencesDays);
        const unexDaysInt = parseInt(unexcusedDays);

        if (absDaysInt > 0) {
            absencesHtml += `<span class="chip alert">📅 ${absDaysInt} Days</span>`;
        }
        if (unexDaysInt > 0) {
            absencesHtml += `<span class="chip alert">⚠️ ${unexDaysInt} Unexcused</span>`;
        }
        if (absencesHtml === '') {
            absencesHtml = `<span class="chip good">No Absences</span>`;
        }

        let tableHtml = `
            <table class="grades-table">
                <thead>
                    <tr>
                        <th style="text-align: left;">Subject</th>
                        <th style="text-align: center;">Average</th>
                        <th style="text-align: left;">Grades</th>
                    </tr>
                </thead>
                <tbody>
        `;

        subjects.forEach(sub => {
            // Simple color logic for German grades
            let colorClassAvg = 'grade-bad';
            const valAvg = parseFloat(sub.state.replace(',', '.'));
            if (!isNaN(valAvg)) {
                if (valAvg < 2.5) colorClassAvg = 'grade-good';
                else if (valAvg < 3.5) colorClassAvg = 'grade-ok';
                else if (valAvg < 4) colorClassAvg = 'grade-orange';
                else if (valAvg < 4.5) colorClassAvg = 'grade-light-red';
            }

            // Render History
            let historyHtml = '';
            if (sub.history && sub.history.length > 0) {
                historyHtml = [...sub.history].reverse().map(h => {
                    let c = 'grade-bad';
                    const v = parseFloat(h.grade.replace(',', '.'));
                    if (!isNaN(v)) {
                        if (v < 2.5) c = 'grade-good';
                        else if (v < 3.5) c = 'grade-ok';
                        else if (v < 4) c = 'grade-orange';
                        else if (v < 4.5) c = 'grade-light-red';
                    }
                    return `<span class="grade-badge ${c} history-badge" title="${h.date}: ${h.comment}">${h.grade}</span>`;
                }).join('');
            } else {
                // Fallback if no history but we have latest
                historyHtml = `<span class="latest-date">Latest: ${sub.latest}</span>`;
            }

            tableHtml += `
                <tr class="subject-row" onclick="
                    const event = new Event('hass-more-info', {
                        bubbles: true,
                        composed: true,
                    });
                    event.detail = { entityId: '${sub.entity_id}' };
                    this.dispatchEvent(event);
                ">
                    <td class="subject-cell">${sub.name}</td>
                    <td class="average-cell"><span class="grade-badge ${colorClassAvg} average-badge">${sub.state}</span></td>
                    <td class="history-cell">${historyHtml}</td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;

        this.content.innerHTML = `
      <style>
        .header-info { display: flex; justify-content: space-between; margin-bottom: 10px; color: var(--secondary-text-color); font-size: 0.9em; }
        .chips { display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap; }
        .chip { background: var(--primary-color); color: white; padding: 5px 10px; border-radius: 12px; font-weight: bold; font-size: 0.85em; display: inline-block;}
        .chip.alert { background: var(--error-color); }
        .chip.good { background: var(--success-color); }
        
        .grades-table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
        .grades-table th { padding: 8px; color: var(--secondary-text-color); font-weight: 500; border-bottom: 1px solid var(--divider-color); vertical-align: bottom;}
        .grades-table td { padding: 8px; border-bottom: 1px solid var(--divider-color); vertical-align: middle; }
        .subject-row { cursor: pointer; transition: background 0.1s; }
        .subject-row:hover { background: rgba(127,127,127, 0.1); }
        
        .subject-cell { font-weight: 500; width: 30%; }
        .average-cell { text-align: center; width: 15%; }
        .history-cell { text-align: left; }
        
        .grade-badge { 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-weight: bold; 
            color: white; 
            display: inline-block;
            margin-right: 2px;
            margin-bottom: 2px;
            font-size: 0.9em;
        }
        .average-badge {
            font-size: 1.1em;
            padding: 4px 8px;
        }
        .history-badge {
            font-size: 0.85em;
            opacity: 0.9;
            cursor: help;
        }
        
        .grade-good { background-color: #4CAF50; } /* Green */
        .grade-ok { background-color: #FFC107; color: black; } /* Yellow */
        .grade-orange { background-color: #FF9800; } /* Orange */
        .grade-light-red { background-color: #EF5350; } /* Light Red */
        .grade-bad { background-color: #D32F2F; } /* Dark Red */
      </style>
      
      <div class="header-info">
        <span>Updated: ${lastUpdate}</span>
      </div>
      
      <div class="chips">${absencesHtml}</div>
      
      ${tableHtml}
    `;
    }

    getCardSize() {
        return 3;
    }
}

customElements.define('home-infopoint-card', HomeInfoPointCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "home-infopoint-card",
    name: "Home InfoPoint Card",
    preview: true,
    description: "A custom card for Home.InfoPoint integration"
});
