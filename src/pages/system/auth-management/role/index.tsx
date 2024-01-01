import { ColumnsType } from 'antd/es/table';
import { API } from '../../../../api';
import { Button, Flex, Popconfirm, Spin, Table } from 'antd/lib';
import { useAxios } from '../../../../hooks/axios';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { RoleFormModal } from './components/role-form-modal';
import { useTranslation } from 'react-i18next';

const RoleManagementPage: React.FC = () => {
    const tableState = useAxios<API.Res<API.SysRole[]>>({ url: API.URL.ROLE_LIST, method: 'get', manual: false });
    const deleteState = useAxios<API.Res<undefined>>({});

    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState<API.SysRole>();
    
    const { t } = useTranslation();

    const columns: ColumnsType<API.SysRole> = [
        {
            title: t("form.common.name"),
            dataIndex: 'name',
            key: 'name',
            width: 220,
        },
        {
            title: t("form.common.description"),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: t("form.common.createAt"),
            dataIndex: 'createAt',
            key: 'createAt',
            width: 220,
        },
        {
            title: t("form.common.updateAt"),
            dataIndex: 'updateAt',
            key: 'updateAt',
            width: 220,
        },
        {
            title: t("form.common.operation"),
            dataIndex: '',
            key: 'x',
            width: 170,
            fixed: 'right',
            render: (_value: unknown, record: API.SysRole) => {
                return (
                    <Flex gap='small'>
                        <Button
                            onClick={() => {
                                setModalData(record);
                                setModalVisible(true);
                            }}
                        >
                            {t("function.edit")}
                        </Button>
                        {record.id != 1 && (
                            <Popconfirm
                                title={t("hint.deleteWarning")}
                                description={t("hint.deleteWarningDetail")}
                                okText={t("function.confirm")}
                                cancelText={t("function.cancel")}
                                onCancel={(e) => {
                                    e?.stopPropagation();
                                }}
                                onConfirm={(e) => {
                                    e?.stopPropagation();
                                    handleDelete(record.id);
                                }}
                                okButtonProps={{ loading: deleteState.loading }}
                            >
                                <Button
                                    onClick={(e) => {
                                        e?.stopPropagation();
                                    }}
                                    danger
                                >
                                    {t("function.delete")}
                                </Button>
                            </Popconfirm>
                        )}
                    </Flex>
                );
            },
        },
    ];

    const handleDelete = async (id: number) => {
        const res = await deleteState.fetchAsync({
            url: `${API.URL.ROLE_DELETE}/${id}`,
            method: 'post',
        });
        if (res?.code === API.CODE.SUCCESS) tableState.fetch();
    };

    return (
        <>
            <Flex gap='middle' vertical>
                <Flex gap='small' justify='end'>
                    <Button
                        key='new'
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setModalData(undefined);
                            setModalVisible(true);
                        }}
                        type='primary'
                    >
                        {t("function.new")}
                    </Button>
                    <Button
                        icon={<SyncOutlined />}
                        onClick={() => {
                            tableState.fetch();
                        }}
                    >
                        {t("function.refresh")}
                    </Button>
                </Flex>
                <Spin spinning={tableState.loading}>
                    <Table key='table' pagination={false} columns={columns} rowKey='id' dataSource={tableState.resp?.data || []} scroll={{ x: 900 }} />
                </Spin>
            </Flex>
            {<RoleFormModal key='modal' record={modalData} visible={modalVisible} onOpenChange={setModalVisible} onFinish={tableState.fetch} />}
        </>
    );
};

export default RoleManagementPage;
