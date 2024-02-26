import { ModalForm, ProForm, ProFormSelect, ProFormSwitch, ProFormText } from '@ant-design/pro-components';
import { API } from '../../../../../api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAxios } from '../../../../../hooks/axios';
import { Alert, Spin, Upload, UploadFile } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';
import { useTranslation } from 'react-i18next';

export interface UserFormModalProps {
    visible: boolean;
    record?: API.SysUser;
    onOpenChange: (visible: boolean) => void;
    onFinish: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = (props: UserFormModalProps) => {
    const roleState = useAxios<API.Res<API.SysRole[]>>({ url: API.URL.ROLE_LIST, method: 'get', manual: false });
    const saveRecordState = useAxios<API.Res<API.SysUser>>({});
    const photoState = useAxios<API.Res<UploadFile>>({ url: API.URL.USER_PHOTO, method: 'post' });

    const [photoUrl, setPhotoUrl] = useState<string>(props.record?.photo || '');
    const [uploadError, setUploadError] = useState('');

    const validationMsgs = useMemo(() => (saveRecordState.resp?.data as API.ValidError)?.errors || [], [saveRecordState.resp?.data]);
    const uploadedFileList = useMemo((): UploadFile<any>[] => {
        return photoUrl ? [{ status: 'done', uid: 'photo', name: 'photo', url: photoUrl }] : [];
    }, [photoUrl]);

    const { t } = useTranslation();

    const uploadRequest = useCallback(
        async (options: any) => {
            const { file } = options;

            const formData = new FormData();
            formData.append('file', file);

            photoState.fetch({
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUploadError('');
        },
        [photoState]
    );

    const onFinish = useCallback(
        async (value: any) => {
            const url = props.record ? `${API.URL.USER_UPDATE}/${props.record.id}` : API.URL.USER_CREATE;
            const res = await saveRecordState.fetchAsync({
                url: url,
                method: 'post',
                data: { ...value, photo: photoUrl, accountStatus: value.accountStatus ? -1 : 0 },
            });
            if (res?.code === API.CODE.SUCCESS) {
                props.onFinish();
                return true;
            }
            return false;
        },
        [photoUrl, props, saveRecordState]
    );

    const beforeUpload = (file: RcFile) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            setUploadError(t('hint.profilePhotoWrongType'));
        }
        const isLt2M = file.size / 1024 < 300;
        if (!isLt2M) {
            setUploadError(t('hint.profilePhotoWrongSize'));
        }
        return isJpgOrPng && isLt2M;
    };

    useEffect(() => {
        saveRecordState.reset();
        setUploadError('');
        setPhotoUrl(props.record?.photo || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props]);

    useEffect(() => {
        if (photoState.resp?.data?.url) setPhotoUrl(photoState.resp?.data?.url);
    }, [photoState.resp?.data?.url]);

    return (
        <Spin spinning={roleState.loading || saveRecordState.loading || photoState.loading}>
            <ModalForm
                modalProps={{ destroyOnClose: true, getContainer: false }}
                initialValues={{
                    ...props.record,
                    roleIds: props.record?.roles.map((item) => {
                        return item.id;
                    }),
                }}
                submitTimeout={1000}
                open={props.visible}
                onFinish={onFinish}
                onOpenChange={props.onOpenChange}
            >
                <ProForm.Group>
                    <ProForm.Item label={t('form.user.photo')} tooltip={t('hint.profilePhoto')} required>
                        <Upload
                            accept='image/png, image/jpeg'
                            action={API.URL.USER_PHOTO}
                            listType='picture-circle'
                            maxCount={1}
                            customRequest={uploadRequest}
                            fileList={uploadedFileList}
                            beforeUpload={beforeUpload}
                        >
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>{t('function.upload')}</div>
                            </div>
                        </Upload>
                        {uploadError && <Alert message={uploadError} type='error' showIcon />}
                    </ProForm.Item>
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormText
                        name='username'
                        width='md'
                        label={t('form.user.username')}
                        placeholder={t('hint.pleaseInput')}
                        rules={[{ max: 15 }, { min: 5 }, { required: true }]}
                        required
                    />
                    <ProFormText.Password
                        name='password'
                        width='md'
                        label={t('form.user.password')}
                        placeholder={t('hint.pleaseInput')}
                        rules={[{ max: 15 }, { min: 8 }]}
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormText
                        name='nickname'
                        width='md'
                        label={t('form.user.nickname')}
                        placeholder={t('hint.pleaseInput')}
                        rules={[{ max: 15 }, { min: 2 }, { required: true }]}
                        required
                    />
                    <ProFormText
                        name='remark'
                        width='md'
                        label={t('form.common.remark')}
                        placeholder={t('hint.pleaseInput')}
                        rules={[{ max: 255 }, { min: 2 }]}
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormSelect
                        name='roleIds'
                        width='md'
                        label={t('form.user.roles')}
                        fieldProps={{
                            mode: 'multiple',
                            placeholder: t('hint.pleaseSelect'),
                            loading: roleState.loading,
                        }}
                        options={roleState.resp?.data?.map((item) => {
                            return { label: item.name, value: item.id };
                        })}
                        required
                    />
                </ProForm.Group>
                {props.record && (
                    <ProForm.Group>
                        <ProFormSwitch name='accountStatus' label={t('status.banned')} />
                    </ProForm.Group>
                )}
                {validationMsgs &&
                    validationMsgs.map((msg) => (
                        <Alert
                            style={{
                                marginBottom: 24,
                            }}
                            key={msg}
                            message={msg}
                            type='error'
                            showIcon
                        />
                    ))}
            </ModalForm>
        </Spin>
    );
};
