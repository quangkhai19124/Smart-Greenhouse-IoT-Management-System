import { Button, Checkbox, Form, InputNumber, Modal, Select } from "antd";
import { X, Plus } from "lucide-react";
import "./style.css";
import { useFetchAutoRules, useUpdateAutoRules } from "./api";
import { useEffect, useState } from "react";
import { useFetchAllSensors } from "@/pages/observation-data/api";
import { useNotificationProvider } from "@/providers/notification";

interface IAutomationModalProps {
    open: boolean;
    onClose: () => void;
    setId?: number | string | undefined;
    refreshSetting: () => void;
}

interface IFormDataItem {
    key: number;
    logicOperator: string | null;
    sensorID?: number;
    operator?: string;
    condition?: number;
    isNew: boolean;
}

interface FormData {
    [key: string]: string | number | null | undefined;
}

export default function AutomationModal(props: IAutomationModalProps) {
    const { open, onClose, setId, refreshSetting } = props;
    const { data: rulesData, isLoading, refetch } = useFetchAutoRules(setId);
    const { data: sensorsData, isLoading: isLoadingSensors } = useFetchAllSensors();
    const { updateAutoRules, isPending } = useUpdateAutoRules(setId);
    const notificationProvider = useNotificationProvider();

    const [formData, setFormData] = useState<IFormDataItem[]>([]);
    const [emailNotification, setEmailNotification] = useState<boolean>(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (rulesData) {
            const initialData: IFormDataItem[] = rulesData.rules.map((rule, index) => ({
                key: index,
                logicOperator: index === 0 ? null : rule.logicOperator,
                sensorID: rule.sensorId,
                operator: rule.operator,
                condition: rule.condition,
                isNew: false
            }));
            
            setFormData(initialData);

            const formValues: FormData = {};
            initialData.forEach((item) => {
                formValues[`logicOperator_${item.key}`] = item.logicOperator;
                formValues[`sensorID_${item.key}`] = item.sensorID;
                formValues[`operator_${item.key}`] = item.operator;
                formValues[`condition_${item.key}`] = item.condition;
            });
            form.setFieldsValue(formValues);

            setEmailNotification(rulesData.setInfo?.emailNotification === "ON");
        } else if (open && !isLoading) {
            setFormData([]);
            form.resetFields();
        }
    }, [rulesData, open, isLoading, form]);

    const addRow = () => {
        const newRow: IFormDataItem = {
            key: Date.now(),
            logicOperator: formData.length === 0 ? null : "AND",
            isNew: true
        };
        setFormData([...formData, newRow]);
    };

    const removeRow = (key: number) => {
        const newFormData = formData.filter(item => item.key !== key);
        const updatedFormData = newFormData.map((item, index) => ({
            ...item,
            logicOperator: index === 0 ? null : (item.logicOperator || "AND")
        }));
        setFormData(updatedFormData);
    };

    const handleSave = async () => {
        try {
            if (formData.length === 0) {
                const payload = {
                    emailNotification: emailNotification ? "ON" : "OFF",
                    rules: []
                };

                const response = await updateAutoRules(payload);
                const data = response?.data;
                const { EC, EM } = data || {};

                if (EC === 0) {
                    notificationProvider.open({
                        type: 'success',
                        message: 'Update rules successfully!',
                    });
                    await refetch();
                    onClose();
                } else {
                    notificationProvider.open({
                        type: 'error',
                        message: EM || 'Update rules failed!',
                    });
                }
                return;
            }

            const values = await form.validateFields();

            const rulesToSave = formData.map((item, index) => ({
                sensorID: values[`sensorID_${item.key}`],
                logicOperator: index === 0 ? null : values[`logicOperator_${item.key}`],
                operator: values[`operator_${item.key}`],
                condition: values[`condition_${item.key}`]
            }));

            const payload = {
                emailNotification: emailNotification ? "ON" : "OFF",
                rules: rulesToSave
            };

            const response = await updateAutoRules(payload);
            const data = response?.data;
            const { EC, EM } = data || {};

            if (EC === 0) {
                notificationProvider.open({
                    type: 'success',
                    message: 'Update rules successfully!',
                });
                await refetch();
                await refreshSetting?.();
            } else {
                notificationProvider.open({
                    type: 'error',
                    message: EM || 'Update rules failed!',
                });
            }
        } catch (error) {
            console.log("Validation Error:", error);
        }
    };

    const closeModal = () => {
        form.resetFields();
        onClose();
    };

    const operatorOptions = [
        { label: "Greater than", value: ">" },
        { label: "Less than", value: "<" },
        { label: "Equal to", value: "=" },
        { label: "Not equal to", value: "!=" },
    ];

    const logicOperatorOptions = [
        { label: "AND", value: "AND" },
        { label: "OR", value: "OR" },
    ];
    

    const sensorOptions = sensorsData?.map((sensor) => ({
        label: sensor.name || sensor.sensorName,
        value: sensor.id,
    })) || [];

    return (
        <Modal
            loading={isLoading || isLoadingSensors}
            open={open}
            title="Automatic Control Rule"
            onCancel={closeModal}
            footer={
                <div className="flex justify-between items-center">
                    <Checkbox 
                        checked={emailNotification}
                        onChange={(e) => setEmailNotification(e.target.checked)}
                    >
                        Send email alert on activation
                    </Checkbox>
                    <div className="flex gap-2">
                        <Button className="!h-10" type="default" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button className="!h-10" type="primary" onClick={handleSave} loading={isPending}>
                            Save
                        </Button>
                    </div>
                </div>
            }
            width={690}
        >
            <div className="py-4">
                <Form 
                    form={form} 
                    className="w-full"
                >
                    <div className="w-full flex flex-col">
                        {formData.map((item, index) => (
                            <div key={item.key} className="flex gap-4 items-center w-full">
                                <Form.Item 
                                    layout="vertical" 
                                    label="AND/OR" 
                                    name={`logicOperator_${item.key}`}
                                    rules={index === 0 ? [] : [
                                        {
                                            required: true,
                                            message: ""
                                        }
                                    ]}
                                >
                                    <Select
                                        placeholder="Select"
                                        className="!w-30 !h-10"
                                        options={logicOperatorOptions}
                                        disabled={index === 0}
                                    />
                                </Form.Item>
                                <Form.Item 
                                    layout="vertical" 
                                    label="Sensor" 
                                    name={`sensorID_${item.key}`}
                                    rules={[
                                        {
                                            required: true,
                                            message: ""
                                        }
                                    ]}
                                >
                                    <Select
                                        placeholder="Select Sensor"
                                        className="!w-40 !h-10"
                                        options={sensorOptions}
                                    />
                                </Form.Item>
                                <Form.Item 
                                    layout="vertical" 
                                    label="Operator" 
                                    name={`operator_${item.key}`}
                                    rules={[
                                        {
                                            required: true,
                                            message: ""
                                        }
                                    ]}
                                >
                                    <Select
                                        placeholder="Select"
                                        className="!w-36 !h-10"
                                        options={operatorOptions}
                                    />
                                </Form.Item>
                                <Form.Item 
                                    layout="vertical" 
                                    label="Sensor Value" 
                                    name={`condition_${item.key}`}
                                    rules={[
                                        {
                                            required: true,
                                            message: ""
                                        }
                                    ]}
                                >
                                    <InputNumber 
                                        className="!w-30 !h-10 sensor-value" 
                                        placeholder="Value" 
                                    />
                                </Form.Item>
                                <div className="mt-1">
                                    <Button
                                        type="text"
                                        className="!border !border-gray-300 hover:bg-gray-100 !px-2 !h-10 !w-10"
                                        onClick={() => removeRow(item.key)}
                                    >
                                        <X className="!text-gray-600" size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        
                        <div className="flex justify-center mt-4">
                            <Button
                                type="dashed"
                                className="!h-10 !w-full flex items-center justify-center gap-2"
                                onClick={addRow}
                            >
                                <Plus size={16} />
                                Add Rule
                            </Button>
                        </div>
                    </div>
                </Form>
            </div>
        </Modal>
    )
}
