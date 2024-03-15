import { Button, Flex, Spin, Tag } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { useAxios } from '../../hooks/axios';
import { PauseCircleTwoTone, PlayCircleTwoTone, SyncOutlined } from '@ant-design/icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ResCode, Res, ScheduledTask } from '../../api/types';
import { API } from '../../api/constants';

const SchedulePage: React.FC = () => {
    const { t } = useTranslation();

    const tableState = useAxios<Res<ScheduledTask[]>>({
        url: API.SCHEDULE_LIST,
        method: 'get',
        manual: false,
    });

    const switchState = useAxios<Res<undefined>>({
        url: API.SCHEDULE_SWITCH,
        method: 'post',
        manual: true,
    });

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

    const onSwitch = useCallback(
        async (name: string) => {
            const res = await switchState.fetchAsync({ data: { name } });
            if (res?.code === ResCode.SUCCESS) tableState.fetch();
        },
        [switchState, tableState]
    );

    return (
        <>
            <Flex gap='middle' vertical>
                <Flex gap='small' justify='end'>
                    <Button
                        icon={<SyncOutlined />}
                        onClick={() => {
                            tableState.fetch();
                        }}
                    >
                        {t('function.refresh')}
                    </Button>
                </Flex>
                <Spin spinning={tableState.loading}>
                    <Table rowKey='name' columns={columns} dataSource={tableState.resp?.data || []} scroll={{ x: 900 }} />
                </Spin>
            </Flex>
        </>
    );
};
export default SchedulePage;
