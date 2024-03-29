import { Button, Flex, Spin, Tag } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { useAxios } from '~/hooks/useAxios';
import { PauseCircleTwoTone, PlayCircleTwoTone, SyncOutlined } from '@ant-design/icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ResCode, Res, ScheduledTask } from '~/api/types';
import { api } from '~/api';

const SchedulePage: React.FC = () => {
    const { t } = useTranslation();

    // 表格数据请求状态对象
    const tableReqState = useAxios<Res<ScheduledTask[]>>({
        ...api.scheduledTask.list,
        manual: false,
    });

    // '开始/暂停' 请求状态对象
    const switchReqState = useAxios<Res<undefined>>({
        ...api.scheduledTask.switch,
        manual: true,
    });

    // 点击 '开始/暂停' 按钮事件
    const onSwitch = useCallback(
        async (name: string) => {
            // 同步发起请求，成功后刷新表格
            const res = await switchReqState.fetch({ data: { name } });
            if (res?.code === ResCode.SUCCESS) tableReqState.fetch();
        },
        [switchReqState, tableReqState]
    );

    // 表格列
    const columns: ColumnsType<ScheduledTask> = [
        {
            title: t('form.common.name'),
            dataIndex: 'name',
            key: 'name',
            width: 160,
        },
        {
            title: t('form.common.status'),
            width: 80,
            dataIndex: 'running',
            key: 'running',
            render: (value) => {
                const color = value ? 'success' : 'error';
                const text = value ? t('status.running') : t('status.stoped');
                return (
                    <Tag key='running' bordered={true} color={color}>
                        {text}
                    </Tag>
                );
            },
        },
        {
            title: t('form.schedule.cronTime'),
            width: 160,
            dataIndex: 'cronTime',
            key: 'cronTime',
            render: (value) => {
                return <span>{value}</span>;
            },
        },
        {
            title: t('form.schedule.oneShot'),
            dataIndex: 'runOnce',
            key: 'runOnce',
            width: 80,
            render: (value: any) => {
                return value ? (
                    <Tag key='runOnce' bordered={true} color='error'>
                        yes
                    </Tag>
                ) : (
                    ''
                );
            },
        },
        {
            title: t('form.schedule.lastExecution'),
            dataIndex: 'lastExecution',
            key: 'lastExecution',
            width: 220,
            render: (value: any) => {
                return value ? new Date(value).toLocaleString() : '-';
            },
        },
        {
            title: t('form.common.operation'),
            dataIndex: '',
            key: 'x',
            width: 100,
            fixed: 'right',
            render: (_value, record) => {
                const icon = record.running ? (
                    <PauseCircleTwoTone style={{ fontSize: '22px' }} />
                ) : (
                    <PlayCircleTwoTone style={{ fontSize: '22px' }} twoToneColor='red' />
                );
                return (
                    <Flex gap='small'>
                        <Button
                            type='text'
                            shape='circle'
                            icon={icon}
                            onClick={() => {
                                onSwitch(record.name);
                            }}
                        />
                    </Flex>
                );
            },
        },
    ];

    return (
        <>
            <Flex gap='middle' vertical>
                <Flex gap='small' justify='end'>
                    <Button
                        icon={<SyncOutlined />}
                        onClick={() => {
                            tableReqState.fetch();
                        }}
                    >
                        {t('function.refresh')}
                    </Button>
                </Flex>
                <Spin spinning={tableReqState.loading}>
                    <Table rowKey='name' columns={columns} dataSource={tableReqState.resp?.data || []} scroll={{ x: 900 }} />
                </Spin>
            </Flex>
        </>
    );
};
export default SchedulePage;
