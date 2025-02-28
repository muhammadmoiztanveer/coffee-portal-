import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Space, Button, Tabs, theme, message } from "antd";
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
    console.log("pagination changed", tableParams);

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
    // fetch(
    //   `https://randomuser.me/api?${qs.stringify(
    //     getRandomuserParams(tableParams)
    //   )}`
    // )
    //   .then((res) => res.json())
    //   .then(({ results }) => {
    //     setData(results);
    //     setLoading(false);
    //     setTableParams({
    //       ...tableParams,
    //       pagination: {
    //         ...tableParams.pagination,
    //         total: 200,
    //         // 200 is mock data, you should read it from server
    //         // total: data.totalCount,
    //       },
    //     });
    //   });
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
    </div>
  );
};

export default paymentHistoryPage;
