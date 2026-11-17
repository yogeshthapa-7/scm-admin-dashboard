import { Modal, type ModalFuncProps } from 'antd';

const { confirm } = Modal;

type ConfirmModalProps = ModalFuncProps;

export const showConfirmModal = (props: ConfirmModalProps) => {
  confirm({
    centered: true,
    okText: 'Confirm',
    cancelText: 'Cancel',
    ...props,
  });
};

