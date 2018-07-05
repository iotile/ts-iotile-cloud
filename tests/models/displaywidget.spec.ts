let args = {"args": {
    "web": {
        "options": {
            "tabViewId": "tripDetail",
            "ngComponent": "EventTable",
            "downloadable": false,
            "ngComponentInputs": {
                "displayCtrlDict": {
                    "5020": {
                        "row": {
                            "axis": {
                                "type": "string",
                                "content": true,
                                "cssClass": "text-right",
                                "key_name": "axis",
                                "sortable": true,
                                "event_field": "axis",
                                "header_name": "Peak Axis"
                            },
                            "peak": {
                                "type": "number",
                                "content": true,
                                "decimal": 2,
                                "cssClass": "text-right",
                                "key_name": "peak",
                                "sortable": true,
                                "short_unit": "G",
                                "event_field": "peak",
                                "header_name": "Peak Value (G)"
                            },
                            "time": {
                                "time": true,
                                "type": "timestamp",
                                "cssClass": "text-center",
                                "key_name": "time",
                                "sortable": true,
                                "event_field": "time",
                                "header_name": "Time (UTC)",
                                "formatted_timestamp": "YYYY-MM-DD HH:mm:ss"
                            },
                            "duration": {
                                "type": "number",
                                "content": true,
                                "decimal": 3,
                                "cssClass": "text-right",
                                "key_name": "duration",
                                "sortable": true,
                                "event_field": "duration",
                                "header_name": "Duration (ms)"
                            },
                            "delta_v_x": {
                                "type": "number",
                                "content": true,
                                "decimal": 3,
                                "cssClass": "text-right",
                                "key_name": "delta_v_x",
                                "sortable": true,
                                "event_field": "delta_v_x",
                                "header_name": "dV(X) (m/s)",
                                "header_label": "dV(X) ($dVUnit)"
                            },
                            "delta_v_y": {
                                "type": "number",
                                "content": true,
                                "decimal": 3,
                                "cssClass": "text-right",
                                "key_name": "delta_v_y",
                                "sortable": true,
                                "event_field": "delta_v_y",
                                "header_name": "dV(Y) (m/s)",
                                "header_label": "dV(Y) ($dVUnit)"
                            },
                            "delta_v_z": {
                                "type": "number",
                                "content": true,
                                "decimal": 3,
                                "cssClass": "text-right",
                                "key_name": "delta_v_z",
                                "sortable": true,
                                "event_field": "delta_v_z",
                                "header_name": "dV(Z) (m/s)"
                            }
                        },
                        "title": "Event Logging",
                        "column_order": [
                            "time",
                            "axis",
                            "peak",
                            "duration",
                            "delta_v_x",
                            "delta_v_y",
                            "delta_v_z"
                        ],
                        "columnUnitsConfigAttributes": {
                            "$dVUnit": ":report:summary:trip:dv:units"
                        }
                    }
                },
                "displayCtrlList": [
                    "5020"
                ]
            }
        }
    }
}
}

let args2 = {"args": {
    "web": {
        "options": {
            "chart": {
                "type": "line",
                "color": "#aba4a4",
                "y_axis_range": {
                    "low": 0,
                    "high": 2000
                }
            },
            "tabViewId": "tripDetail",
            "ngComponent": "ChartSeries",
            "seriesGroup": "environmental_data",
            "downloadable": true
        }
    }
}}