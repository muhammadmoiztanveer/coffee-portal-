import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Space, Button, message, Spin, Dropdown } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined, DeleteFilled, EditFilled } from "@ant-design/icons";
import DeleteModal from "@/components/modals/deleteModal/deleteModal";
import EditUserModal from "@/components/modals/editUserModal/editUserModal";
import { getNextTokenForUsers } from "@/graphql/customQueries";
import { listUsers } from "@/graphql/queries";
import { generateClient } from "aws-amplify/api";
import { updateUsers, deleteUsers } from "@/graphql/mutations";
// import {
//   updateUserAttributes,
//   signIn,
//   fetchAuthSession,
// } from "aws-amplify/auth";
// import {
//   CognitoIdentityProviderClient,
//   AdminUpdateUserAttributesCommand,
// } from "@aws-sdk/client-cognito-identity-provider";

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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editFormToOpen, setEditFormToOpen] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchFilter, setSearchFilter] = useState([]);
  const [verifyingEmail, setVerifyingEmail] = useState(null);
  const searchInput = useRef(null);

  const isFetching = useRef(false);
  const client = generateClient();

  useEffect(() => {
    if (nextTokens.length > 0) {
      let totalUsers = 0;

      totalUsers =
        parseInt(nextTokens.length) * parseInt(tableParams.pagination.pageSize);

      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: totalUsers,
        },
      }));
    }
  }, [nextTokens]);

  const fetchTotalCount = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    setIsContentLoading(true);

    let paginationToken = null;

    try {
      do {
        const response = await client.graphql({
          query: getNextTokenForUsers,
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

        paginationToken = response.data.listUsers.nextToken;

        if (paginationToken) {
          setNextTokens((prev) => [...prev, paginationToken]);
        }
      } while (paginationToken);
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

  const listUsersData = async () => {
    try {
      setLoading(true);
      const { current, pageSize } = tableParams.pagination;
      const nextToken = current === 1 ? null : nextTokens[current - 1];

      const response = await client.graphql({
        query: listUsers,
        variables: {
          limit: pageSize,
          nextToken: nextToken,
        },
      });

      const { items } = response.data.listUsers;
      setUsers(items);
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

  const fetchSearchedTotalCount = async () => {
    setLoading(true);
    setFilteredUsers([]);

    try {
      const filter =
        searchFilter.length > 0
          ? {
              and: searchFilter.map((filterObj) => ({
                or: [
                  {
                    [filterObj.columnName]: {
                      contains: filterObj.search.toLowerCase(),
                    },
                  },
                  {
                    [filterObj.columnName]: {
                      beginsWith: filterObj.search.toLowerCase(),
                    },
                  },
                ],
              })),
            }
          : undefined;

      const response = await client.graphql({
        query: listUsers,
        variables: {
          limit: 1000,
          nextToken: null,
          filter: filter,
        },
      });

      const { items } = response.data.listUsers;
      const total = items.length;

      setTableParams((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, total },
      }));

      setFilteredUsers(items);
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
    if (filteredUsers.length > 0) {
      listSearchedUsersData();
    }
  }, [filteredUsers]);

  const listSearchedUsersData = async () => {
    setUsers([]);

    try {
      setLoading(true);

      const { current, pageSize } = tableParams.pagination;
      const start = (current - 1) * pageSize;
      const end = start + pageSize;

      const usersData = filteredUsers.slice(start, end);

      setUsers(usersData);
    } catch (error) {
      console.error("Error processing data:", error);

      messageApi.open({
        type: "error",
        content: "Error displaying data. Please try again later.",
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
  const showEditModal = (user, whichForm) => {
    setUserToEdit(user);

    setEditFormToOpen(whichForm);
  };

  useEffect(() => {
    if (userToEdit) {
      setIsEditModalVisible(true);
    }
  }, [userToEdit]);

  const handleEditUser = async (values, setSubmitting) => {
    setSubmitting(true);

    try {
      // import.meta.env.VITE_USER_POOL_ID,
     

       // if (editFormToOpen === "personal_info") {
      //   try {
      //     // Get credentials using Amplify v6 auth
      //     const { credentials } = await fetchAuthSession();

      //     // Create Cognito client with obtained credentials
      //     const client = new CognitoIdentityProviderClient({
      //       region: "eu-north-1",
      //       credentials: {
      //         accessKeyId: credentials.accessKeyId,
      //         secretAccessKey: credentials.secretAccessKey,
      //         sessionToken: credentials.sessionToken,
      //       },
      //     });

      //     const params = {
      //       UserPoolId: "eu-north-1_CF96T6a0l",
      //       Username: values.email,
      //       UserAttributes: [
      //         { Name: "name", Value: values.name },
      //         { Name: "phone_number", Value: values.phoneNumber },
      //         { Name: "custom:countryCode", Value: values.countryCode },
      //         {
      //           Name: "custom:phoneNumber",
      //           Value: values.phoneNumberWithoutCountryCode,
      //         },
      //       ],
      //     };

      //     await client.send(new AdminUpdateUserAttributesCommand(params));
      //     setSubmitting(false);
      //   } catch (error) {
      //     message.error(`Error updating profile: ${error.message}`);
      //     console.error("ERROR updating Cognito user", error);
      //     setSubmitting(false);
      //     return;
      //   }
      // }

      const editedUser = {
        id: userToEdit.id,
        email: values.email,
        name: values.name,
        nameLower: values.name.toLowerCase().replace(/\s/g, ""),
        countryCode: values.countryCode,
        phoneNumber: values.phoneNumberWithoutCountryCode,
        fullPhoneNumber: values.phoneNumber,
        stamps: values.stamps,
        freeDrinks: values.freeDrinks,
        coins: values.coins,
        balance: values.balance,
      };

      await client.graphql({
        query: updateUsers,
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
    setEditFormToOpen(null);
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

        const deleteUsersResponse = await client.graphql({
          query: deleteUsers,
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
    const fetchData = async () => {
      if (searchFilter.length > 0) {
        setFilteredUsers([]);
        setUsers([]);

        await fetchSearchedTotalCount();
      } else {
        setNextTokens([]);
        setUsers([]);

        await fetchTotalCount();
        await listUsersData();
      }
    };

    fetchData();
  }, [searchFilter]);

  useEffect(() => {
    if (searchFilter.length > 0) {
      listSearchedUsersData();
    } else {
      listUsersData();
    }
  }, [tableParams.pagination.current, tableParams.pagination.pageSize]);

  const handleReset = async (
    clearFilters,
    dataIndex,
    close,
    setLocalSelectedKeys
  ) => {
    clearFilters();

    setSearchFilter((prev) =>
      prev.filter((filter) => filter.columnName !== dataIndex)
    );

    setLocalSelectedKeys([]);

    close();
  };

  const getColumnSearchProps = (dataIndex) => {
    const [localSelectedKeys, setLocalSelectedKeys] = useState([]);

    return {
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
            value={localSelectedKeys[0] || ""}
            onChange={(e) => {
              setLocalSelectedKeys(e.target.value ? [e.target.value] : []);
            }}
            onPressEnter={() =>
              handleSearch(localSelectedKeys, confirm, dataIndex)
            }
            style={{
              marginBottom: 8,
              display: "block",
            }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() =>
                handleSearch(localSelectedKeys, confirm, dataIndex)
              }
              icon={<SearchOutlined />}
              size="small"
              style={{
                width: 90,
              }}
            >
              Search
            </Button>
            <Button
              onClick={() =>
                clearFilters &&
                handleReset(
                  clearFilters,
                  dataIndex,
                  close,
                  setLocalSelectedKeys
                )
              }
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
                close();
              }}
            >
              Close
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
      filterDropdownProps: {
        onOpenChange(open) {
          if (open) {
            setTimeout(() => searchInput.current?.select(), 100);
          }
        },
      },
      render: (text, record, index) => {
        const relevantFilter = searchFilter.find(
          (filter) => filter.columnName === dataIndex
        );

        if (relevantFilter && relevantFilter.search) {
          return (
            <Highlighter
              highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
              searchWords={[relevantFilter.search]}
              autoEscape
              textToHighlight={text ? text.toString() : ""}
            />
          );
        } else {
          return text;
        }
      },
    };
  };
  // END - Search Filter

  const getMenuItems = (record) => {
    return [
      {
        key: "1",
        label: (
          <button onClick={() => showEditModal(record, "personal_info")}>
            Edit Personal Info
          </button>
        ),
      },
      {
        key: "2",
        label: (
          <button onClick={() => showEditModal(record, "user_account")}>
            Manage User Account
          </button>
        ),
      },
    ];
  };

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      render: (email) => email || "N/A",
    },
    {
      title: "Customer Name",
      dataIndex: "name",
      render: (name) => name || "N/A",
      ...getColumnSearchProps("nameLower"),
    },
    {
      title: "Phone Number",
      dataIndex: "fullPhoneNumber",
      render: (fullPhoneNumber) => fullPhoneNumber || "N/A",
      ...getColumnSearchProps("fullPhoneNumber"),
    },
    {
      title: "Total Balance",
      dataIndex: "balance",
      render: (balance) =>
        balance !== null && balance !== undefined ? balance.toFixed(2) : "N/A",
    },
    {
      title: "Coins",
      dataIndex: "coins",
      render: (coins) =>
        coins !== null && coins !== undefined ? coins : "N/A",
    },
    {
      title: "Stamps",
      dataIndex: "stamps",
      render: (stamps) =>
        stamps !== null && stamps !== undefined ? stamps : "N/A",
    },
    {
      title: "Purchase Count",
      dataIndex: "purchaseCount",
      render: (purchaseCount) =>
        purchaseCount !== null && purchaseCount !== undefined
          ? purchaseCount
          : "N/A",
    },
    {
      title: "Free Drinks",
      dataIndex: "freeDrinks",
      render: (freeDrinks) =>
        freeDrinks !== null && freeDrinks !== undefined ? freeDrinks : "N/A",
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          {/* Edit Icon */}
          <Dropdown
            menu={{
              items: getMenuItems(record),
            }}
            placement="bottomRight"
            arrow
          >
            <button className="text-base cursor-pointer border rounded-lg py-1 px-2">
              <EditFilled />
            </button>
          </Dropdown>

          {/* Delete Icon */}
          <button
            className="text-base text-red-600 cursor-pointer border rounded-lg py-1 px-2"
            onClick={() => handleDelete(record.id)}
          >
            <DeleteFilled />
          </button>
        </div>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    console.log(pagination, filters, sorter);

    if (pagination.pageSize !== tableParams.pagination.pageSize) {
      // setNextTokens([]);
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

  return (
    <>
      {contextHolder}

      <div className="flex flex-col gap-8 mt-8">
        <div className="text-2xl font-medium">Users Managment</div>

        {isContentLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <Spin size="large" />
          </div>
        ) : (
          <>
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
          </>
        )}

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
          formToShow={editFormToOpen}
        />
      </div>
    </>
  );
};

export default userManagmentPage;
