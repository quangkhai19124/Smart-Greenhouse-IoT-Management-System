import { ISchedule } from "@/models/deviceControl.type";
import { Button, Modal, TimePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { ArrowLeftRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useNotificationProvider } from "@/providers/notification";
import { useUpdateScheduleDevice } from "../Settings/api";

interface IScheduleModalProps {
    open: boolean;
    onClose: () => void;
    selectedSchedule: ISchedule | null;
    devId?: number;
    refreshSetting?: () => void;
}

const dayLabels: Array<{ key: number; short: string; full: string }> = [
    { key: 1, short: "M", full: "Monday" },
    { key: 2, short: "T", full: "Tuesday" },
    { key: 3, short: "W", full: "Wednesday" },
    { key: 4, short: "T", full: "Thursday" },
    { key: 5, short: "F", full: "Friday" },
    { key: 6, short: "S", full: "Saturday" },
    { key: 0, short: "S", full: "Sunday" },
];

export default function ScheduleModal(props: IScheduleModalProps) {
    const { open, onClose, selectedSchedule, devId, refreshSetting } = props;
    const notificationProvider = useNotificationProvider();
    const { updateScheduleDevice, isPending } = useUpdateScheduleDevice(devId, selectedSchedule?.id);

    const [activeDays, setActiveDays] = useState<number[]>([]);
    const [startTime, setStartTime] = useState<Dayjs | null>(null);
    const [endTime, setEndTime] = useState<Dayjs | null>(null);

    useMemo(() => {
        if (!open) return;
        if (!selectedSchedule) {
            setActiveDays([]);
            setStartTime(dayjs().hour(7).minute(0).second(0));
            setEndTime(dayjs().hour(9).minute(0).second(0));
            return;
        }

        const mapFullToKey = new Map(dayLabels.map(d => [d.full, d.key] as const));
        const days = (selectedSchedule.actionDay || "")
            .split(",")
            .map(s => s.trim())
            .map(name => mapFullToKey.get(name))
            .filter((v): v is number => typeof v === "number");
        setActiveDays(days);

        const st = selectedSchedule.timeStart ? dayjs(selectedSchedule.timeStart, "HH:mm:ss") : null;
        const et = selectedSchedule.timeEnd ? dayjs(selectedSchedule.timeEnd, "HH:mm:ss") : null;
        setStartTime(st);
        setEndTime(et && st && et.isBefore(st) ? st : et);

    }, [open, selectedSchedule]);

    const activeDaysText = useMemo(() => {
        if (!activeDays.length) return "No days selected";
        const names = dayLabels
            .filter((d) => activeDays.includes(d.key))
            .map((d) => d.full);
        return `Every ${names.join(", ")}`;
    }, [activeDays]);

    const toggleDay = (key: number) => {
        setActiveDays((prev) =>
            prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
        );
    };

    const handleStartChange = (value: Dayjs | null) => {
        setStartTime(value);
        if (value && endTime && endTime.isBefore(value)) {
            setEndTime(value);
        }
    };

    const handleEndChange = (value: Dayjs | null) => {
        if (value && startTime && value.isBefore(startTime)) {
            return; // disallow selecting end time earlier than start time
        }
        setEndTime(value);
    };

    const handleSave = async () => {
        if (!devId || !selectedSchedule) {
            onClose();
            return;
        }

        const names = dayLabels
            .filter((d) => activeDays.includes(d.key))
            .map((d) => d.full);
        const payload = {
            dev_id: devId,
            schedId: Number(selectedSchedule.id),
            actionDay: names,
            timeStart: startTime ? startTime.format("HH:mm:ss") : dayjs().format("HH:mm:ss"),
            timeEnd: endTime ? endTime.format("HH:mm:ss") : dayjs().format("HH:mm:ss"),
        };

        try {
            const res = await updateScheduleDevice(payload);
            const EC = res?.data?.EC;
            const EM = res?.data?.EM;
            if (EC === 0) {
                notificationProvider.open({ type: 'success', message: 'Updated schedule successfully' });
                refreshSetting?.();
            } else {
                notificationProvider.open({ type: 'error', message: EM || 'Update schedule failed' });
            }
        } catch {
            notificationProvider.open({ type: 'error', message: 'Update schedule failed' });
        }
    };

    return (
        <Modal
            open={open}
            title="Schedule Control Rule"
            onCancel={onClose}
            footer={
                <div className="flex justify-end items-center">
                    <div className="flex gap-2">
                        <Button className="!h-10" type="default" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button className="!h-10" type="primary" onClick={handleSave} loading={isPending}>
                            Save
                        </Button>
                    </div>
                </div>
            }
            width={600}
        >
            <div className="py-2 pb-6">
                <div className="mb-4">
                    <div className="text-base font-semibold mb-2">Active Days</div>
                    <div className="flex gap-4">
                        {dayLabels.map((d) => {
                            const isActive = activeDays.includes(d.key);
                            return (
                                <button
                                    key={d.key}
                                    className={`w-18 h-18 rounded-xl border cursor-pointer ${
                                        isActive
                                            ? "bg-green-50 border-green-200 text-green-700"
                                            : "bg-white border-gray-200 text-gray-700"
                                    } font-semibold text-xl`}
                                    onClick={() => toggleDay(d.key)}
                                >
                                    {d.short}
                                </button>
                            );
                        })}
                    </div>
                    <div className="text-gray-600 mt-4">{activeDaysText}</div>
                </div>

                <div className="mt-6">
                    <div className="text-base font-semibold mb-3">Operating Time</div>
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600 mb-1">Start Time</span>
                            <TimePicker
                                value={startTime}
                                onChange={handleStartChange}
                                format="hh:mm A"
                                className="!h-10 !w-40"
                                use12Hours
                            />
                        </div>
                        <ArrowLeftRight className="text-gray-600" />
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600 mb-1">End Time</span>
                            <TimePicker
                                value={endTime}
                                onChange={handleEndChange}
                                format="hh:mm A"
                                className="!h-10 !w-40"
                                use12Hours
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}


