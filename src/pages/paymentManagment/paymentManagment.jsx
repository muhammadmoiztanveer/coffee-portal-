import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Space, Button, Tabs, theme } from "antd";
import { SearchOutlined, DeleteFilled, EditFilled } from "@ant-design/icons";
import qs from "qs";
import AddDepositModal from "@/components/modals/addDepositModal/addDepositModal";

const paymentManagmentPage = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  useEffect(() => {
    console.log("dataaa", data);
  }, data);

  // Delete Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null); // Store record to delete
  //   const navigate = useNavigate();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null); // Store the user to edit

  const [isDepositsTableVisible, setIsDepositsTableVisible] = useState(true);
  const [isPurchasesTableVisible, setIsPurchasesTableVisible] = useState(false);

  const showEditModal = (user) => {
    setUserToEdit(user); // Set the user data for editing
    setIsEditModalVisible(true);
  };

  const handleEditUser = async (values) => {
    try {
      // Make your API call here to update the user using 'values'
      console.log("Updating user with:", values); // Placeholder for API call
      // Example using fetch:
      // const response = await fetch(`/api/users/${userToEdit.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values),
      // });
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // const updatedUser = await response.json();
      // ... update your user list with the updatedUser ...
    } catch (error) {
      console.error("Error updating user:", error);
      // Handle the error (e.g., display an error message)
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setUserToEdit(null); // Clear the user data after cancel
  };

  const showModal = (record) => {
    setRecordToDelete(record); // Set the record to delete
    setIsModalVisible(true);
  };

  const handleOk = () => {
    // Perform delete logic here using recordToDelete
    if (recordToDelete) {
      console.log("Deleting record:", recordToDelete);
      // Your delete logic here (e.g., API call)
      // Example using fetch:
      // fetch(`/api/records/${recordToDelete.id}`, { method: 'DELETE' })
      //   .then(response => { /* ... */ })
      //   .catch(error => { /* ... */ });
    }
    setIsModalVisible(false);
    setRecordToDelete(null); // Clear after delete
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setRecordToDelete(null); // Clear if cancelled
  };

  const handleDelete = (record) => {
    showModal(record);
  };
  // Delete Modal

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const depositsTableColumns = [
    {
      title: "Email",
      dataIndex: "email",
      sorter: true,
      ...getColumnSearchProps("email"),
    },
    {
      title: "Customer Name",
      dataIndex: "name",
      sorter: true,
      render: (name) => `${name.first} ${name.last}`,
      ...getColumnSearchProps("name"),
    },
    {
      title: "Deposit Balance",
      dataIndex: "balance",
    },
    {
      title: "Payment Type",
      dataIndex: "payment-type",
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex justify-center space-x-2">
          {/* Edit Icon */}
          <Button
            onClick={() =>
              showEditModal({
                id: 12,
                name: `User 12`,
                email: `user12@example.com`,
                phoneNumber: "84239084093284908",
                depositBalance: Math.floor(Math.random() * 1000),
                coins: Math.floor(Math.random() * 500),
                stamps: Math.floor(Math.random() * 200),
              })
            }
          >
            Add Deposit
          </Button>
        </div>
      ),
    },
  ];

  const paymentsTableColumns = [
    {
      title: "Email",
      dataIndex: "email",
      sorter: true,
      ...getColumnSearchProps("email"),
    },
    {
      title: "Customer Name",
      dataIndex: "name",
      sorter: true,
      render: (name) => `${name.first} ${name.last}`,
      ...getColumnSearchProps("name"),
    },
    {
      title: "Current Balance",
      dataIndex: "balance",
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex justify-center space-x-2">
          {/* Edit Icon */}
          <Button
            onClick={() =>
              showEditModal({
                id: 12,
                name: `User 12`,
                email: `user12@example.com`,
                phoneNumber: "84239084093284908",
                depositBalance: Math.floor(Math.random() * 1000),
                coins: Math.floor(Math.random() * 500),
                stamps: Math.floor(Math.random() * 200),
              })
            }
          >
            Add Payment
          </Button>
        </div>
      ),
    },
  ];

  const getRandomuserParams = (params) => ({
    results: params.pagination?.pageSize,
    page: params.pagination?.current,
    ...params,
  });

  const fetchData = () => {
    setLoading(true);
    fetch(
      `https://randomuser.me/api?${qs.stringify(
        getRandomuserParams(tableParams)
      )}`
    )
      .then((res) => res.json())
      .then(({ results }) => {
        setData(results);
        setLoading(false);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: 200,
            // 200 is mock data, you should read it from server
            // total: data.totalCount,
          },
        });
      });
  };

  useEffect(fetchData, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.sortOrder,
    tableParams?.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  function showDepositsTable() {
    setIsPurchasesTableVisible(false);
    setIsDepositsTableVisible(true);
  }

  function showPurchasesTable() {
    setIsDepositsTableVisible(false);
    setIsPurchasesTableVisible(true);
  }

  return (
    <div className="flex flex-col gap-10 mt-8">
      <div className="text-2xl font-medium">Payment Managment</div>

      <div className="flex gap-6 font-medium">
        <button
          className={
            isDepositsTableVisible
              ? "w-full py-4 bg-primary text-white rounded-xl"
              : "w-full py-4 bg-white hover:bg-primary/80 text-primary hover:text-white rounded-xl"
          }
          onClick={showDepositsTable}
        >
          Manage Deposits
        </button>
        <button
          className={
            isPurchasesTableVisible
              ? "w-full py-4 bg-primary text-white rounded-xl"
              : "w-full py-4 bg-white hover:bg-primary/80 text-primary hover:text-white rounded-xl"
          }
          onClick={showPurchasesTable}
        >
          Manage Purchases
        </button>
      </div>

      {isDepositsTableVisible && (
        <Table
          columns={depositsTableColumns}
          rowKey={(record) => record.login.uuid}
          dataSource={data}
          pagination={tableParams.pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      )}

      {isPurchasesTableVisible && (
        <Table
          columns={paymentsTableColumns}
          rowKey={(record) => record.login.uuid}
          dataSource={data}
          pagination={tableParams.pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      )}

      <AddDepositModal
        isVisible={isEditModalVisible}
        onCancel={handleCancelEdit}
        initialValues={userToEdit}
        onSubmit={handleEditUser}
        isUserEditingPending={false}
      />
    </div>
  );
};

export default paymentManagmentPage;
