import { useEffect, useState } from "react";
import { IDeviceDashboardData, ISchedule } from "@/models/deviceControl.type";
import { Button, Drawer, InputNumber, Radio, Select, Skeleton, Tooltip, Popconfirm } from "antd";
import { ChevronDown, ChevronLeft, SquarePen, Trash, X } from "lucide-react";
import TableAnt from "@/components/TableAnt";
import "./style.css";
import AutomationModal from "../AutomationModal";
import ScheduleModal from "../ScheduleModal";
import { useCreateScheduleDevice, useCreateSetRule, useDeleteScheduleDevice, useDeleteSetRule, useFetchDetailSetting, useUpdateDeviceMode } from "./api";
import { useNotificationProvider } from "@/providers/notification";

interface ISettingsProps {
    open: boolean;
    onClose: () => void;
    device?: IDeviceDashboardData | null;
    refetchAllDevices: () => void;
}

interface IOptionAutoControl {
    key: string;
    status?: boolean;
    power?: string;
    condition?: string;
    action?: string;
}

interface IOptionScheduleControl {
    id: string | number;
    timeStart?: string;
    timeEnd?: string;
    actionDay?: string;
    status?: string;
    power?: number;
}

export default function Settings({ open, onClose, device, refetchAllDevices }: ISettingsProps) {
    const [automationModalOpen, setAutomationModalOpen] = useState(false);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [selectedSetId, setSelectedSetId] = useState<number | string | undefined>(undefined);
    const ADD_DATA_KEY = "add-data";
    const { data: deviceSetting, isLoading, refetch } = useFetchDetailSetting(device?.id);
    const [selected, setSelected] = useState<string | null>(deviceSetting?.mode ?? null);
    const { updateDeviceMode } = useUpdateDeviceMode(device?.id);
    const { deleteScheduleDevice, isPending: isDeletingScheduleDevice } = useDeleteScheduleDevice();
    const { createSetRule, isPending: isCreatingSet } = useCreateSetRule();
    const [selectedSchedule, setSelectedSchedule] = useState<ISchedule | null>(null);
    const { deleteSetRule } = useDeleteSetRule();

    const { createScheduleDevice } = useCreateScheduleDevice();

    const notificationProvider = useNotificationProvider();

    const [newSetStatus, setNewSetStatus] = useState<"ON" | "OFF" | null>(null);
    const [newSetPower, setNewSetPower] = useState<number | null>();

    useEffect(() => {
        if (open) {
            refetch();
        }
    }, [open, refetch]);

    useEffect(() => {
        setSelected(deviceSetting?.mode ?? null);
    }, [deviceSetting, open]);

    const [automationData, setAutomationData] = useState<IOptionAutoControl[]>([
        { key: ADD_DATA_KEY },
    ]);

    const [scheduleData, setScheduleData] = useState<IOptionScheduleControl[]>([
        { id: ADD_DATA_KEY },
    ]);

    useEffect(() => {
        const arr = deviceSetting?.schedules ?? [];
        const newSchedule = [{ id: ADD_DATA_KEY }, ...arr];
        setScheduleData(newSchedule);
    }, [deviceSetting?.schedules]);

    useEffect(() => {
        const sets = deviceSetting?.setRule ?? [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: IOptionAutoControl[] = sets.map((s: any) => ({
            key: String(s.id),
            status: s.status === "ON",
            power: String(s.power ?? "---"),
            condition: Array.isArray(s.rules) && s.rules.length
                ? s.rules
                    .map((r: { sensor?: { name?: string }; operator?: string; condition?: string }) =>
                        `${r.sensor?.name ?? "sensor"} ${r.operator ?? ""} ${r.condition ?? ""}`
                    )
                    .join(" ; ")
                : "---",
            action: s.status === "ON" ? "Turn On" : "Turn Off",
        }));
        setAutomationData([{ key: ADD_DATA_KEY }, ...mapped]);
    }, [deviceSetting?.setRule]);


    const allOptionsStatus = [
        { value: "ON", label: "ON" },
        { value: "OFF", label: "OFF" },
    ];

    const handleAddNewRecord = async (selectedStatus: "ON" | "OFF") => {
        if (!device?.id) return;
        if (newSetPower == null || newSetPower < 0 || newSetPower > 100) {
            notificationProvider.open({ type: 'error', message: 'Please select Power (0-100%) before creating.' });
            return;
        }
        try {
            const res = await createSetRule({ status: selectedStatus, dev_Id: device.id, power: newSetPower });
            const EC = res?.data?.EC;
            const EM = res?.data?.EM;
            if (EC === 0) {
                notificationProvider.open({ type: 'success', message: 'Created new set successfully' });
                await refetch();
                setNewSetStatus(null);
                setNewSetPower(null);
            } else {
                notificationProvider.open({ type: 'error', message: EM || 'Create set failed' });
            }
        } catch {
            notificationProvider.open({ type: 'error', message: 'Create set failed' });
        }
    };

    const handleDeleteRecord = async (record: IOptionAutoControl) => {
        // setAutomationData(prev => {
        //     const filteredData = prev.filter(item => item.key !== keyToDelete);
        //     if (!filteredData.some(item => item.key === ADD_DATA_KEY)) {
        //         return [{ key: ADD_DATA_KEY }, ...filteredData];
        //     }
        //     return filteredData;
        // });

        const response = await deleteSetRule({ setID: record.key });

        const data = response?.data;
        const { EC, EM } = data || {};
        if(EC === 0) {
            notificationProvider.open({
                type: 'success',
                message: 'Delete set rule successfully!',
            });
            refetch();
        } else {
            notificationProvider.open({
                type: 'error',
                message: EM || 'Delete set rule failed!',
            });
        }
    };

    const handleAddNewScheduleRecord = async (power: number) => {
        if(power < 0 || power > 100) {
            notificationProvider.open({
                type: 'error',
                message: 'Power must be between 0 and 100!',
            });
            return;
        }

        const res = await createScheduleDevice({ dev_Id: device?.id ?? 0, power });
        const data = res?.data;
        const { EC, EM } = data || {};
        if(EC === 0) {
            notificationProvider.open({
                type: 'success',
                message: 'Create schedule successfully!',
            });
            await refetch();
        }
        else {
            notificationProvider.open({
                type: 'error',
                message: EM || 'Create schedule failed!',
            });
        }
    };

    const handleDeleteScheduleRecord = async (keyToDelete: string | number) => {
        try {
            const response = await deleteScheduleDevice(Number(keyToDelete), device?.id ?? 0);
            console.log(response);
            const data = response?.data;
            const { EC, EM } = data || {};
            if(EC === 0) {
                notificationProvider.open({
                    type: 'success',
                    message: 'Delete schedule successfully!',
                });
                refetch();
            } else {
                console.log(EM);
                notificationProvider.open({
                    type: 'error',
                    message: EM || 'Delete schedule failed!',
                });
            } 
        } catch (error) {
            console.log(error);
            notificationProvider.open({
                type: 'error',
                message: 'Delete schedule failed!',
            });
        }
    };

    const handleUpdateDeviceMode = async (id: number | undefined, mode: string) => {
        if (id) {
            const prevMode = selected;
            setSelected(mode);
            const response = await updateDeviceMode({ id, mode });
            const data = response?.data;
            const { EC, EM } = data || {};
            if(EC === 0) {
                await refetchAllDevices();
            } else {
                setSelected(prevMode);
                notificationProvider.open({
                    type: 'error',
                    message: EM || 'Update device mode failed!',
                });
            }
        }
    };

    const AutomaticControl = () => {
        const availableOptions = allOptionsStatus; // always allow ON/OFF to create new

        const addRow = automationData.find(item => item.key === ADD_DATA_KEY);
        const otherRows = automationData.filter(item => item.key !== ADD_DATA_KEY);
        const dataSource = addRow ? [addRow, ...otherRows] : otherRows;

        return (
            <div className="py-2 pl-4">
                <div className="relative rounded-lg overflow-hidden">
                    <TableAnt
                        columns={[
                            {
                                title: "Status",
                                key: "status",
                                width: 120,
                                render: (_, record) => (
                                    record.key !== ADD_DATA_KEY ? (
                                        <span>{record.status ? "ON" : "OFF"}</span>
                                    ) : (
                                        <Select
                                            placeholder="Select status"
                                            options={availableOptions}
                                            value={newSetStatus}
                                            onChange={(value) => setNewSetStatus(value as "ON" | "OFF")}
                                            className="w-full [&_.ant-select-selector]:!border-none [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!shadow-none"
                                        />
                                    )
                                ),
                            },
                            {
                                title: "Power",
                                key: "power",
                                width: 140,
                                render: (_, record) => (
                                    record.key !== ADD_DATA_KEY ? (
                                        <span>{record.power}</span>
                                    ) : (
                                        <InputNumber
                                            placeholder="Power %"
                                            min={0}
                                            max={100}
                                            defaultValue={newSetPower ?? undefined}
                                            onPressEnter={(e) => {
                                                const input = e.target as HTMLInputElement;
                                                if (!input.value) return;
                                                const v = Number(input.value);
                                                if (Number.isFinite(v)) setNewSetPower(v);
                                            }}
                                            onBlur={(e) => {
                                                const input = e.target as HTMLInputElement;
                                                if (!input.value) return;
                                                const v = Number(input.value);
                                                if (Number.isFinite(v)) setNewSetPower(v);
                                            }}
                                            className="!w-full !border-none !bg-transparent !shadow-none !outline-none add-input"
                                        />
                                    )
                                ),
                            },
                            { title: "Condition", dataIndex: "condition", key: "condition" },
                            {
                                title: "Action",
                                key: "action",
                                render: (_, record) => (
                                    record.key !== ADD_DATA_KEY ? (
                                        <div className="flex gap-4 items-center">
                                            <Tooltip title="Edit">
                                                <SquarePen className="!text-gray-600 cursor-pointer" size={18} onClick={() => {
                                                    setSelectedSetId(record.key);
                                                    setAutomationModalOpen(true);
                                                }} />
                                            </Tooltip>
                                            <Popconfirm
                                                title="Delete set rule?"
                                                description="Are you sure you want to delete this set rule?"
                                                okText="Yes"
                                                cancelText="No"
                                                onConfirm={() => handleDeleteRecord(record)}
                                            >

                                                <Trash
                                                    className="!text-red-600 cursor-pointer" size={18}
                                                />
                                            </Popconfirm>
                                        </div>
                                    ) : (
                                        <Button
                                            type="primary"
                                            size="small"
                                            loading={isCreatingSet}
                                            disabled={!newSetStatus || newSetPower == null}
                                            onClick={() => newSetStatus && handleAddNewRecord(newSetStatus)}
                                            className="!h-8"
                                        >
                                            Create
                                        </Button>
                                    )
                                ),
                            },
                        ]}
                        dataSource={dataSource}
                    />
                </div>
            </div>
        );
    };

    const ScheduleControl = () => {
        const dataSource = scheduleData;

        return (
            <div className="py-2 pl-4">
                <TableAnt
                    columns={[
                        {
                            title: "Power",
                            key: "power",
                            render: (_, record) => {
                                return (
                                    <>
                                        {record.id !== ADD_DATA_KEY ? (
                                            <span>{record.power}</span>
                                        ) : (
                                            <InputNumber
                                                placeholder="Set power"
                                                min={0}
                                                max={100}
                                                onPressEnter={(e) => {
                                                    const input = e.target as HTMLInputElement;
                                                    if (!input.value) return
                                                    handleAddNewScheduleRecord(Number(input.value));
                                                }}
                                                onBlur={(e) => {
                                                    if (!e.target.value) return
                                                    handleAddNewScheduleRecord(Number(e.target.value));
                                                }}
                                                className="!w-full !border-none !bg-transparent !shadow-none !outline-none add-input"
                                            />
                                        )}
                                    </>
                                );
                            },
                        },
                        {
                            title: "Operating Schedule",
                            dataIndex: "operatingSchedule",
                            key: "operatingSchedule",
                            render: (_, record) => {
                                return (
                                    <span>{record.timeStart} - {record.timeEnd}</span>
                                );
                            },
                        },
                        {
                            title: "Active Days",
                            dataIndex: "actionDay",
                            key: "actionDay",
                            render: (_, record) => {
                                const firstDay = record.actionDay?.split(',')[0];

                                const countDays = record.actionDay?.split(',').length ?? 0;

                                return (
                                    <span>{firstDay} {countDays > 1 ? '+' + (countDays - 1) + ' days' : ''}</span>
                                );
                            }
                        },
                        {
                            title: "Action",
                            key: "action",
                            render: (_, record) =>
                                record.id !== ADD_DATA_KEY && (
                                    <div className="flex gap-4 items-center">
                                        <Tooltip title="Edit">
                                            <SquarePen className="!text-gray-600 cursor-pointer" size={18} onClick={() => {
                                                setSelectedSchedule(record as ISchedule);
                                                setScheduleModalOpen(true)
                                            }} />
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            
                                            <Popconfirm
                                                title="Delete schedule?"
                                                description="Are you sure you want to delete this schedule?"
                                                okText="Yes"
                                                cancelText="No"
                                                onConfirm={() => handleDeleteScheduleRecord(record.id)}
                                            >
                                                <Button
                                                    type="text"
                                                    loading={isDeletingScheduleDevice}
                                                    className="!p-0 !m-0"
                                                >
                                                    <Trash
                                                        className="!text-red-600 cursor-pointer" size={18}
                                                    />
                                                </Button>
                                            </Popconfirm>
                                        </Tooltip>
                                    </div>
                                ),
                        },
                    ]}
                    dataSource={dataSource}
                />
            </div>
        );
    };

    const options = [
        { value: "MANUAL", label: "Manual Control", hasCollapsed: false },
        { value: "AI_POWERED", label: "AI-powered Monitoring", hasCollapsed: false },
        { value: "AUTO", label: "Automatic Control", content: <AutomaticControl />, hasCollapsed: true },
        { value: "SCHEDULE", label: "Schedule Control", content: <ScheduleControl />, hasCollapsed: true },
    ];

    return (
        <Drawer
            title={
                <div className="flex justify-between items-center">
                    {`Device Settings - ${device?.deviceName ?? ""}`}
                    <Button
                        type="text"
                        onClick={onClose}
                        icon={<X />}
                        className="rounded-lg"
                    />
                </div>
            }
            closable={false}
            open={open}
            width={650}
            onClose={onClose}
            footer={
                <div className="flex justify-end gap-4 py-2">
                    <Button onClick={onClose} className="rounded-lg !h-10">Cancel</Button>
                </div>
            }
        >
            {isLoading ? (
                <Skeleton active />
            ) : (
                <div className="flex flex-col gap-6">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                        >
                            <div className="flex gap-2 cursor-pointer" onChange={() => handleUpdateDeviceMode(device?.id, opt.value)}>
                                <Radio
                                    checked={selected === opt.value}
                                    style={{ transform: "scale(1.2)" }}
                                />
                                <div className="flex justify-between items-center w-full">
                                    <span className="text-base font-semibold">{opt.label}</span>
                                    <div hidden={!opt.hasCollapsed}>
                                        {selected === opt.value ? <ChevronDown className="text-gray-600" /> : <ChevronLeft className="text-gray-600" />}
                                    </div>
                                </div>
                            </div>

                            {selected === opt.value && opt.hasCollapsed && (
                                <div className="mt-3 text-gray-600 animate-[fadeIn_0.3s_ease]">
                                    {opt.content}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <AutomationModal
                open={automationModalOpen}
                onClose={() => {
                    setAutomationModalOpen(false);
                    setSelectedSetId(undefined);
                }}
                setId={selectedSetId}
                refreshSetting={refetch}
            />
            <ScheduleModal
                open={scheduleModalOpen}
                onClose={() => setScheduleModalOpen(false)}
                selectedSchedule={selectedSchedule}
                devId={device?.id}
                refreshSetting={refetch}
            />
        </Drawer>
    );
}
