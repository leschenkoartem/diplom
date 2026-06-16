"""Порогова модель виявлення аномалій (табл. 6.1, кресленик Д4)."""

from dataclasses import dataclass
from typing import List, Optional, Tuple

from app.models import AnomalyLevel


@dataclass
class AnomalyResult:
    level: AnomalyLevel
    parameter: Optional[str]
    message: str


# Таблиця 6.1 – Порогові значення контрольованих параметрів вантажу
THRESHOLDS = {
    "temperature": {
        "target": 20.0,
        "tolerance": 2.0,
        "critical_low": 8.0,
        "critical_high": 28.0,
    },
    "humidity": {
        "normal_min": 40.0,
        "normal_max": 70.0,
        "critical_low": 35.0,
        "critical_high": 75.0,
    },
    "vibration": {
        "normal_max": 1.5,
        "warning": 0.8,
        "critical": 2.5,
    },
}


def evaluate_readings(temperature: float, humidity: float, vibration: float) -> AnomalyResult:
    """Алгоритм: отримання даних → порівняння з порогами → рівень аномалії."""
    issues: List[Tuple[AnomalyLevel, str, str]] = []

    t_cfg = THRESHOLDS["temperature"]
    if temperature < t_cfg["critical_low"] or temperature > t_cfg["critical_high"]:
        issues.append(
            (
                AnomalyLevel.critical,
                "temperature",
                f"Критична температура: {temperature}°C",
            )
        )
    elif abs(temperature - t_cfg["target"]) > t_cfg["tolerance"]:
        issues.append(
            (
                AnomalyLevel.warning,
                "temperature",
                f"Відхилення температури від норми: {temperature}°C",
            )
        )

    h_cfg = THRESHOLDS["humidity"]
    if humidity < h_cfg["critical_low"] or humidity > h_cfg["critical_high"]:
        issues.append(
            (
                AnomalyLevel.critical,
                "humidity",
                f"Критична вологість: {humidity}%",
            )
        )
    elif humidity < h_cfg["normal_min"] or humidity > h_cfg["normal_max"]:
        issues.append(
            (
                AnomalyLevel.warning,
                "humidity",
                f"Вологість поза нормальним діапазоном: {humidity}%",
            )
        )

    v_cfg = THRESHOLDS["vibration"]
    if vibration > v_cfg["critical"]:
        issues.append(
            (
                AnomalyLevel.critical,
                "vibration",
                f"Критична вібрація: {vibration} g",
            )
        )
    elif vibration > v_cfg["normal_max"]:
        issues.append(
            (
                AnomalyLevel.warning,
                "vibration",
                f"Підвищена вібрація: {vibration} g",
            )
        )

    if not issues:
        return AnomalyResult(AnomalyLevel.normal, None, "Параметри в нормі")

    level_order = {AnomalyLevel.critical: 2, AnomalyLevel.warning: 1, AnomalyLevel.normal: 0}
    worst = max(issues, key=lambda x: level_order[x[0]])
    return AnomalyResult(worst[0], worst[1], worst[2])


def level_to_ui(level: AnomalyLevel) -> str:
    if level == AnomalyLevel.critical:
        return "critical"
    if level == AnomalyLevel.warning:
        return "warning"
    return "normal"
