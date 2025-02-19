import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Space, Button, message, Spin } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined, DeleteFilled, EditFilled } from "@ant-design/icons";
import DeleteModal from "@/components/modals/deleteModal/deleteModal";
import EditUserModal from "@/components/modals/editUserModal/editUserModal";
import { listUsers } from "@/graphql/queries";
import { generateClient } from "aws-amplify/api";
import { updateUser, deleteUser } from "@/graphql/mutations";

const userManagmentPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const [nextTokens, setNextTokens] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchFilter, setSearchFilter] = useState([]);
  const searchInput = useRef(null);

  const isFetching = useRef(false);

  const client = generateClient();

  const fetchTotalCount = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    setIsContentLoading(true);

    let totalUsers = 0;
    let paginationToken = null;

    try {
      let allUsers = [];
      do {
        const response = await client.graphql({
          query: listUsers,
          variables: {
            limit: tableParams.pagination.pageSize,
            nextToken: paginationToken,
          },
        });

        if (!response.data || !response.data.listUsers) {
          console.error("Invalid response format:", response);
          messageApi.open({
            type: "error",
            content: "Error fetching users. Invalid response from the server.",
          });
          break;
        }

        const fetchedUsers = response.data.listUsers.items;
        allUsers.push(...fetchedUsers);
        paginationToken = response.data.listUsers.nextToken;

        if (paginationToken) {
          setNextTokens((prev) => [...prev, paginationToken]);
        }

        // console.log(
        //   "Fetched Users Length",
        //   fetchedUsers.length,
        //   "Next Token:",
        //   paginationToken
        // );

        totalUsers += fetchedUsers.length;
      } while (paginationToken);

      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: totalUsers,
        },
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      messageApi.open({
        type: "error",
        content: "Error fetching users. Please try again later.",
      });
    } finally {
      isFetching.current = false;
      setLoading(false);
      setIsContentLoading(false);
    }
  };

  const fetchSearchedTotalCount = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setNextTokens([]);
    setLoading(true);

    let totalUsers = 0;
    let paginationToken = null;

    try {
      let allUsers = [];
      do {
        const filter =
          searchFilter.length > 0
            ? {
                and: searchFilter.map((filterObj) => ({
                  [filterObj.columnName]: { eq: filterObj.search },
                })),
              }
            : undefined;

        console.log("filterssss from tota count fucntion", filter);

        const response = await client.graphql({
          query: listUsers,
          variables: {
            limit: tableParams.pagination.pageSize,
            nextToken: paginationToken,
            filter: filter,
          },
        });

        if (!response.data || !response.data.listUsers) {
          console.error("Invalid response format:", response);
          messageApi.open({
            type: "error",
            content: "Error fetching users. Invalid response from the server.",
          });
          break;
        }

        const fetchedUsers = response.data.listUsers.items;
        allUsers.push(...fetchedUsers);
        paginationToken = response.data.listUsers.nextToken;

        if (paginationToken) {
          setNextTokens((prev) => [...prev, paginationToken]);
        }

        // console.log(
        //   "Fetched Users Length",
        //   fetchedUsers.length,
        //   "Next Token:",
        //   paginationToken
        // );

        totalUsers += fetchedUsers.length;
      } while (paginationToken);

      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: totalUsers,
        },
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      messageApi.open({
        type: "error",
        content: "Error fetching users. Please try again later.",
      });
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  };

  const listUsersData = async () => {
    try {
      setLoading(true);
      const { current, pageSize } = tableParams.pagination;
      const nextToken = current === 1 ? null : nextTokens[current - 1];

      // Construct the filter object from the searchFilter state
      const filter =
        searchFilter.length > 0
          ? {
              and: searchFilter.map((filterObj) => ({
                [filterObj.columnName]: { eq: filterObj.search },
              })),
            }
          : undefined;

      // Make the GraphQL request
      const response = await client.graphql({
        query: listUsers,
        variables: {
          limit: pageSize,
          nextToken: nextToken,
          ...(filter && { filter }), // Include filter only if it exists
        },
      });

      // Extract data and update state
      const { items, nextToken: newNextToken } = response.data.listUsers;
      setUsers(items);
      setHasMore(!!newNextToken);
    } catch (error) {
      console.error("Error fetching users:", error);
      messageApi.open({
        type: "error",
        content: "Error fetching users. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const listSearchedUsersData = async () => {
    try {
      setLoading(true);
      const { current, pageSize } = tableParams.pagination;
      const nextToken = current === 1 ? null : nextTokens[current - 1];

      // Construct the filter object from the searchFilter state
      const filter =
        searchFilter.length > 0
          ? {
              and: searchFilter.map((filterObj) => ({
                [filterObj.columnName]: { eq: filterObj.search },
              })),
            }
          : undefined;

      // Make the GraphQL request
      const response = await client.graphql({
        query: listUsers,
        variables: {
          limit: pageSize,
          nextToken: nextToken,
          filter: filter,
        },
      });

      // Extract data and update state
      const { items, nextToken: newNextToken } = response.data.listUsers;
      setUsers(items);
      setHasMore(!!newNextToken);
    } catch (error) {
      console.error("Error fetching users:", error);
      messageApi.open({
        type: "error",
        content: "Error fetching users. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalCount();
    listUsersData();
  }, []);

  // START - Edit Modal
  const showEditModal = (user) => {
    setUserToEdit(user);
  };

  useEffect(() => {
    if (userToEdit) {
      setIsEditModalVisible(true);
    }
  }, [userToEdit]);

  const handleEditUser = async (values, setSubmitting) => {
    setSubmitting(true);

    try {
      const editedUser = {
        id: values.id,
        email: values.email,
        name: values.name,
        phoneNumber: values.phoneNumber,
        stamps: values.stamps,
        freeDrinks: values.freeDrinks,
        coins: values.coins,
        balance: values.balance,
      };

      await client.graphql({
        query: updateUser,
        variables: { input: editedUser },
      });

      listUsersData();

      messageApi.open({
        type: "success",
        content: `Record updated successfully for ${userToEdit.email} !`,
      });
    } catch (error) {
      console.error("Error updating user:", error);

      messageApi.open({
        type: "error",
        content: "There was an error updating the record. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setUserToEdit(null);
  };
  // END - Edit Modal

  // START - Delete Modal
  const showModal = (userId) => {
    setRecordToDelete(userId);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      if (recordToDelete) {
        console.log("Deleting record:", recordToDelete);

        const userToDelete = {
          id: recordToDelete,
        };

        const deleteUserResponse = await client.graphql({
          query: deleteUser,
          variables: { input: userToDelete },
        });

        messageApi.open({
          type: "success",
          content: `Record deleted successfully !`,
        });
      }

      listUsersData();

      setIsModalVisible(false);
      setRecordToDelete(null);
    } catch (err) {
      console.error("User Delete error :", err);
      messageApi.open({
        type: "error",
        content: `Error Deleting record !`,
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setRecordToDelete(null);
  };

  const handleDelete = (userId) => {
    showModal(userId);
  };
  // END - Delete Modal

  // START - Search Filter
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();

    setSearchFilter((prev) => {
      const updatedFilters = [...prev];

      const searchValue = selectedKeys?.[0]?.trim();

      if (!searchValue) {
        const existingFilterIndex = updatedFilters.findIndex(
          (filter) => filter.columnName === dataIndex
        );

        if (existingFilterIndex !== -1) {
          updatedFilters.splice(existingFilterIndex, 1);
        }

        return updatedFilters;
      }

      const existingFilterIndex = updatedFilters.findIndex(
        (filter) => filter.columnName === dataIndex
      );

      if (existingFilterIndex !== -1) {
        updatedFilters[existingFilterIndex] = {
          columnName: dataIndex,
          search: searchValue,
        };
      } else {
        updatedFilters.push({ columnName: dataIndex, search: searchValue });
      }

      return updatedFilters;
    });
  };

  useEffect(() => {
    fetchSearchedTotalCount();
    listSearchedUsersData();
  }, [searchFilter]);

  useEffect(() => {
    console.log("Search Filter", searchFilter);
  }, [searchFilter]);

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
          {/* <Button
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
          </Button> */}
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
    render: (text, record, index) => {
      // Include record and index if needed
      const relevantFilter = searchFilter.find(
        (filter) => filter.columnName === dataIndex
      );

      if (relevantFilter && relevantFilter.search) {
        // Check if a filter exists for this column *and* has a search term
        return (
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[relevantFilter.search]} // Use the search term from the filter
            autoEscape
            textToHighlight={text ? text.toString() : ""}
          />
        );
      } else {
        return text; // Return original text if no filter or no search term
      }
    },
  });
  // END - Search Filter

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
      dataIndex: "phoneNumber",
      ...getColumnSearchProps("phoneNumber"),
    },
    {
      title: "Deposit Balance",
      dataIndex: "balance",
    },
    {
      title: "Coins",
      dataIndex: "coins",
    },
    {
      title: "Stamps",
      dataIndex: "stamps",
    },
    {
      title: "Free Drinks",
      dataIndex: "freeDrinks",
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          {/* Edit Icon */}
          <button
            className="text-xl cursor-pointer"
            onClick={() => showEditModal(record)}
          >
            <EditFilled />
          </button>

          {/* Delete Icon */}
          <button
            className="text-xl text-red-600 hover:text-red-700 focus:outline-none cursor-pointer"
            onClick={() => handleDelete(record.id)}
          >
            <DeleteFilled />
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    listUsersData();
  }, [tableParams.pagination.current, tableParams.pagination.pageSize]);

  const handleTableChange = (pagination, filters, sorter) => {
    console.log(pagination, filters, sorter);

    if (pagination.pageSize !== tableParams.pagination.pageSize) {
      setNextTokens([]);
      setHasMore(true);
      setTableParams({
        pagination: {
          ...pagination,
          current: 1,
        },
        filters,
        sortOrder: sorter.order,
        sortField: sorter.field,
      });
    } else {
      setTableParams({
        pagination,
        filters,
        sortOrder: sorter.order,
        sortField: sorter.field,
      });
    }
  };

  if (isContentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {contextHolder}

      <div className="flex flex-col gap-8 mt-8">
        <div className="text-2xl font-medium">Users Managment</div>

        <Table
          columns={columns}
          rowKey={(record) => record.id}
          dataSource={users}
          pagination={{
            ...tableParams.pagination,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
          }}
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
    </>
  );
};

export default userManagmentPage;
