import { Table, TableProps } from "antd";
import './style.css';

export default function TableAnt<T extends object>(props: TableProps<T>) {
    return (
        <Table<T>
            {...props}
            rowKey={props.rowKey ?? "id"}
            pagination={false}
            bordered={false}
            rowClassName={(_, index) => (index % 2 === 0 ? "light-row" : "")}
            style={{ background: "#fff", borderRadius: 12 }}
        />
    );
}
