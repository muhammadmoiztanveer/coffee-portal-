import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Space, Button } from "antd";
import { SearchOutlined, DeleteFilled, EditFilled } from "@ant-design/icons";
import qs from "qs";
import DeleteModal from "../../components/modals/deleteModal/deleteModal";
import EditUserModal from "../../components/modals/editUserModal/editUserModal";
import "./userManagment.css";

const userManagmentPage = () => {
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

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      sorter: true,
    },
    {
      title: "Customer Name",
      dataIndex: "name",
      sorter: true,
      render: (name) => `${name.first} ${name.last}`,
      ...getColumnSearchProps("name"),
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      ...getColumnSearchProps("age"),
    },
    {
      title: "Deposit Balance",
      dataIndex: "balance",
    },
    {
      title: "Coins",
      dataIndex: "coin",
    },
    {
      title: "Stamps",
      dataIndex: "phone",
    },
    {
      title: "Actions",
      dataIndex: "phone",
      render: (_, record) => (
        <div className="flex space-x-2">
          {/* Edit Icon */}
          <button
            className="text-xl cursor-pointer"
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
            <EditFilled />
          </button>

          {/* Delete Icon */}
          <button
            className="text-xl text-red-600 hover:text-red-700 focus:outline-none cursor-pointer"
            onClick={() => handleDelete(record)}
          >
            <DeleteFilled />
          </button>
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

  return (
    <div className="flex flex-col gap-8 mt-8">
      <div className="text-2xl font-medium">Users Managment</div>

      <Table
        columns={columns}
        rowKey={(record) => record.login.uuid}
        dataSource={data}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
      />

      <DeleteModal
        isVisible={isModalVisible}
        onCancel={handleCancel}
        onConfirm={handleOk}
      />

      <EditUserModal
        isVisible={isEditModalVisible}
        onCancel={handleCancelEdit}
        initialValues={userToEdit}
        onSubmit={handleEditUser}
        isUserEditingPending={false}
      />
    </div>
  );
};

export default userManagmentPage;
