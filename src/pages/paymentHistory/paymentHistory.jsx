import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Space, Button, Tabs, theme, message, Spin } from "antd";
import {
  SearchOutlined,
  DeleteFilled,
  EditFilled,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { generateClient } from "aws-amplify/api";
import { listUsers } from "../../graphql/queries";
import { getNextTokenForUsers } from "../../graphql/customQueries";
import {
  GetUserWithAllDeposits,
  GetUserWithAllPayments,
} from "../../graphql/customQueries";
import moment from "moment";
import Highlighter from "react-highlight-words";

const paymentHistoryPage = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const [messageApi, contextHolder] = message.useMessage();
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [nextTokens, setNextTokens] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [excessRecords, setExcessRecords] = useState({});
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchFilter, setSearchFilter] = useState([]);
  const searchInput = useRef(null);

  const [historyNextTokens, setHistoryNextTokens] = useState({
    deposits: {},
    payments: {},
  });
  const [histories, setHistories] = useState([]);

  const isFetching = useRef(false);
  const client = generateClient();

  // Delete Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  //   const navigate = useNavigate();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddDepositModalVisible, setIsAddDepositModalVisible] =
    useState(false);
  const [isMakePurchaseModalVisible, setIsMakePurchaseModalVisible] =
    useState(false);

  const [userToEdit, setUserToEdit] = useState(null);

  const [isDepositsTableVisible, setIsDepositsTableVisible] = useState(true);
  const [isPurchasesTableVisible, setIsPurchasesTableVisible] = useState(false);

  const [isDepositsHistoryTableVisible, setIsDepositsHistoryTableVisible] =
    useState(false);
  const [isPurchasesHistoryTableVisible, setIsPurchasesHistoryTableVisible] =
    useState(false);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  useEffect(() => {
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

  const fetchTotalHistoryCount = async (userID, table) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    setIsContentLoading(true);

    let paginationToken = null;
    const query =
      table === "deposits" ? GetUserWithAllDeposits : GetUserWithAllPayments;

    try {
      do {
        const response = await client.graphql({
          query: query,
          variables: {
            userId: userID,
            limit: tableParams.pagination.pageSize,
            nextToken: paginationToken,
          },
        });

        if (!response.data || !response.data.getUsers) {
          console.error("Invalid response format:", response);
          messageApi.open({
            type: "error",
            content:
              "Error fetching history. Invalid response from the server.",
          });
          break;
        }

        const historyData =
          table === "deposits"
            ? response.data.getUsers.deposits
            : response.data.getUsers.payments;

        paginationToken = historyData.nextToken;

        if (paginationToken) {
          setHistoryNextTokens((prev) => ({
            ...prev,
            [table]: {
              ...prev[table],
              [userID]: [...(prev[table]?.[userID] || []), paginationToken],
            },
          }));
        }
      } while (paginationToken);
    } catch (error) {
      console.error("Error fetching history:", error);
      messageApi.open({
        type: "error",
        content: "Error fetching history. Please try again later.",
      });
    } finally {
      isFetching.current = false;
      setLoading(false);
      setIsContentLoading(false);
    }
  };

  const listHistories = async (userID, table) => {
    console.log("useridddddddddd", userID, "table", table);

    try {
      setLoading(true);
      const { current, pageSize } = tableParams.pagination;
      const userTokens = setHistoryNextTokens?.[table]?.[userID] || [];
      const nextToken = current === 1 ? null : userTokens[current - 2];

      const query =
        table === "deposits" ? GetUserWithAllDeposits : GetUserWithAllPayments;

      const response = await client.graphql({
        query: query,
        variables: {
          userId: userID,
          limit: pageSize,
          nextToken: nextToken,
        },
      });
      console.log("resposnee", response);

      const userData = response.data.getUsers;
      const items =
        table === "deposits"
          ? userData.deposits.items
          : userData.payments.items;

      setHistories(items);
    } catch (error) {
      console.error("Error fetching history:", error);
      messageApi.open({
        type: "error",
        content: "Error fetching history. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchFilter.length > 0) {
      listSearchedUsersData();
    } else {
      listUsersData();
    }
  }, [tableParams.pagination.current, tableParams.pagination.pageSize]);

  useEffect(() => {
    fetchTotalCount();
    listUsersData();
  }, []);

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
            value={localSelectedKeys[0] || ""} // Use local state
            onChange={(e) => {
              setLocalSelectedKeys(e.target.value ? [e.target.value] : []);
            }}
            onPressEnter={() =>
              handleSearch(localSelectedKeys, confirm, dataIndex)
            } // Use local state
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
              } // Use local state
              icon={<SearchOutlined />}
              size="small"
              style={{
                width: 90,
              }}
            >
              Search
            </Button>
            <Button
              onClick={
                () =>
                  clearFilters &&
                  handleReset(
                    clearFilters,
                    dataIndex,
                    close,
                    setLocalSelectedKeys
                  ) // Pass local setter
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
    };
  };

  const showDepositHistory = (user) => {
    setUserToEdit(user);

    fetchTotalHistoryCount(user.id, "deposits");
    listHistories(user.id, "deposits");

    setIsPurchasesHistoryTableVisible(false);
    setIsDepositsHistoryTableVisible(true);
  };

  const showPurchaseHistory = (user) => {
    setUserToEdit(user);

    fetchTotalHistoryCount(user.id, "payments");
    listHistories(user.id, "payments");

    setIsDepositsHistoryTableVisible(false);
    setIsPurchasesHistoryTableVisible(true);
  };

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      // sorter: true,
    },
    {
      title: "Customer Name",
      dataIndex: "name",
      // sorter: true,
      render: (name) => `${name.first} ${name.last}`,
      ...getColumnSearchProps("nameLower"),
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      ...getColumnSearchProps("phoneNumber"),
    },
    {
      title: "Actions",
      render: (_, record) => {
        return (
          <div className="flex space-x-2">
            {isDepositsTableVisible && (
              <Button onClick={() => showDepositHistory(record)}>
                Show Deposit History
              </Button>
            )}

            {isPurchasesTableVisible && (
              <Button onClick={() => showPurchaseHistory(record)}>
                Show Payment History
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const depositsTableColumns = [
    {
      title: "Deposit Amount",
      dataIndex: "amount",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (createdAt) => {
        if (!createdAt) return "";
        return moment(createdAt).format("MMMM Do YYYY, h:mm:ss a");
      },
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      render: (updatedAt) => {
        if (!updatedAt) return "";
        return moment(updatedAt).format("MMMM Do YYYY, h:mm:ss a");
      },
    },
  ];

  const paymentsTableColumns = [
    {
      title: "Payment Amount",
      dataIndex: "amount",
    },
    {
      title: "Stamps",
      dataIndex: "stamps",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (createdAt) => {
        if (!createdAt) return "";
        return moment(createdAt).format("MMMM Do YYYY, h:mm:ss a");
      },
    },
  ];

  const getRandomuserParams = (params) => ({
    results: params.pagination?.pageSize,
    page: params.pagination?.current,
    ...params,
  });

  const fetchData = () => {
    setLoading(true);
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
    setIsDepositsHistoryTableVisible(false);
    setIsPurchasesHistoryTableVisible(false);

    setIsPurchasesTableVisible(false);
    setIsDepositsTableVisible(true);
  }

  function showPurchasesTable() {
    setIsPurchasesHistoryTableVisible(false);
    setIsDepositsHistoryTableVisible(false);

    setIsDepositsTableVisible(false);
    setIsPurchasesTableVisible(true);
  }

  return (
    <div className="flex flex-col gap-10 mt-8">
      <div className="text-2xl font-medium">Payments History</div>

      <div className="flex gap-6 font-medium">
        {/* #c67c4e */}
        <button
          className={
            isDepositsTableVisible
              ? "w-full py-4 bg-primary text-white rounded-xl"
              : "w-full py-4 bg-white hover:bg-primary/80 text-primary hover:text-white rounded-xl"
          }
          onClick={showDepositsTable}
        >
          Deposits History
        </button>

        <button
          className={
            isPurchasesTableVisible
              ? "w-full py-4 bg-primary text-white rounded-xl"
              : "w-full py-4 bg-white hover:bg-primary/80 text-primary hover:text-white rounded-xl"
          }
          onClick={showPurchasesTable}
        >
          Purchases History
        </button>
      </div>

      {isContentLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {!isDepositsHistoryTableVisible && !isPurchasesHistoryTableVisible ? (
            <Table
              columns={columns}
              rowKey={(record) => record.id}
              dataSource={users}
              pagination={tableParams.pagination}
              loading={loading}
              onChange={handleTableChange}
            />
          ) : null}

          {isDepositsHistoryTableVisible && (
            <>
              <ArrowLeftOutlined
                className="text-2xl"
                onClick={() => {
                  setIsDepositsHistoryTableVisible(false);
                }}
              />

              <div className="flex flex-col gap-4">
                <div className="text-xl font-medium mb-4 w-full text-center rounded-xl bg-white p-4">
                  Customer Deposits History
                </div>

                <div>
                  <span className="font-bold">Customer Name :</span>{" "}
                  <span>{userToEdit?.name || "N/A"}</span>
                </div>

                <div>
                  <span className="font-bold">Email :</span>{" "}
                  {userToEdit?.email || "N/A"} <span></span>
                </div>
              </div>

              <Table
                columns={depositsTableColumns}
                rowKey={(record) => record.id}
                dataSource={histories}
                pagination={{
                  ...tableParams.pagination,
                  total: histories.length,
                }}
                loading={loading}
                onChange={handleTableChange}
              />
            </>
          )}

          {isPurchasesHistoryTableVisible && (
            <>
              <ArrowLeftOutlined
                className="text-2xl"
                onClick={() => {
                  setIsPurchasesHistoryTableVisible(false);
                }}
              />

              <div className="flex flex-col gap-4 w-full">
                <div className="text-xl font-medium mb-4 w-full text-center rounded-xl bg-white p-4">
                  Customer Purchases History
                </div>

                <div>
                  <span className="font-bold">Customer Name :</span>{" "}
                  <span>{userToEdit?.name || "N/A"}</span>
                </div>

                <div>
                  <span className="font-bold">Email :</span>{" "}
                  {userToEdit?.email || "N/A"} <span></span>
                </div>
              </div>

              <Table
                columns={paymentsTableColumns}
                rowKey={(record) => record.id}
                dataSource={histories}
                pagination={{
                  ...tableParams.pagination,
                  total: histories.length,
                }}
                loading={loading}
                onChange={handleTableChange}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default paymentHistoryPage;
