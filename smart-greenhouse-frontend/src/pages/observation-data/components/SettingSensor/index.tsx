import { Button, Form, Input, InputNumber, Modal, Select } from "antd";
import { X, Plus } from "lucide-react";
import "./style.css";
import { ISensorData } from "@/models/observationdata.type";
import { useFetchNotificationRules, useUpdateNotificationRule } from "./api";
import { LogicOperator, Operator } from "@/utils/enums";
import { useState, useEffect } from "react";
import { useNotificationProvider } from "@/providers/notification";

interface IFormDataItem {
    key: number;
    logicOperator: LogicOperator | null;
    operator?: Operator;
    condition?: number;
    isNew: boolean;
}

interface ISensorSettingProps {
    open: boolean;
    onClose: () => void;
    selectedItems: ISensorData | null;
}

interface FormData {
  [key: string]: string | number | LogicOperator | Operator | null | undefined;
}

export default function SettingSensor(props: ISensorSettingProps) {
    const { open, onClose, selectedItems } = props;
    const { data: notificationRules, isLoading, refetch } = useFetchNotificationRules(selectedItems ? selectedItems.id : 0);
    const { updateRule, isPending } = useUpdateNotificationRule(selectedItems ? selectedItems.id : 0);
    const notificationProvider = useNotificationProvider();

    const [formData, setFormData] = useState<IFormDataItem[]>([]);
    const [form] = Form.useForm();

    useEffect(() => {
        console.log("Notification Rules:", notificationRules);
        if (notificationRules && notificationRules.length > 0) {
            const initialData = notificationRules.map((rule, index) => ({
                key: index,
                logicOperator: index === 0 ? null : rule.logicOperator,
                operator: rule.operator,
                condition: rule.condition,
                isNew: false
            }));
            setFormData(initialData);

            const formValues: FormData = {};
            initialData.forEach((item) => {
                formValues[`logicOperator_${item.key}`] = item.logicOperator;
                formValues[`operator_${item.key}`] = item.operator;
                formValues[`condition_${item.key}`] = item.condition;
            });
            form.setFieldsValue(formValues);
        } else {
            setFormData([]);
        }
    }, [notificationRules, open, form]);

    const addRow = () => {
        const newRow: IFormDataItem = {
            key: Date.now(),
            logicOperator: null,
            operator: undefined,
            condition: undefined,
            isNew: true
        };
        setFormData([...formData, newRow]);
    };

    const removeRow = (key: number) => {
        setFormData(formData.filter(item => item.key !== key));
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            console.log("Form Data:", formData);
            console.log("Form Values:", values);

            const dataToSave = formData.map((item, index) => ({
                logicOperator: index === 0 ? null : values[`logicOperator_${item.key}`],
                operator: values[`operator_${item.key}`],
                condition: values[`condition_${item.key}`]
            }));

            console.log("Data to Save:", dataToSave);

            await updateRule(dataToSave);

            notificationProvider.open({
                type: 'success',
                message: 'Notification rules updated successfully',
            });

            refetch();
        } catch (error) {
            console.log("Validation Error:", error);
        }
    };

    const closeModal = () => {
        form.resetFields();
        onClose();
    }

    return (
        <Modal
            loading={isLoading}
            open={open}
            title={`Sensor Settings ${selectedItems ? `- ${selectedItems.name}` : ""}`}
            onCancel={() => {
                closeModal();
            }}
            footer={
                <div className="flex justify-end items-center">
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
            width={700}
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
                                        options={[
                                            { label: "AND", value: LogicOperator.AND },
                                            { label: "OR", value: LogicOperator.OR }
                                        ]}
                                        disabled={index === 0}
                                    />
                                </Form.Item>
                                <Form.Item layout="vertical" label="Sensor" name={`sensor_${item.key}`}>
                                    <Input 
                                        defaultValue={selectedItems?.name}
                                        readOnly
                                        className="!h-10"
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
                                        options={[
                                            { label: "Greater than", value: Operator.GREATER_THAN },
                                            { label: "Less than", value: Operator.LESS_THAN },
                                            { label: "Equal to", value: Operator.EQUAL },
                                            { label: "Not equal to", value: Operator.NOT_EQUAL },
                                        ]}
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
