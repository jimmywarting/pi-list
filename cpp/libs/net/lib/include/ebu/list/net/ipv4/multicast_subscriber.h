#pragma once

#include "ebu/list/net/ipv4/address.h"

namespace ebu_list::ipv4
{
    void subscribe();

    class multicast_subscription
    {
    public:
        multicast_subscription(ipv4::address listen_address,
            ipv4::address multicast_address,
            port multicast_port);
        ~multicast_subscription();

    private:
        int sd_ = -1;
    };
    
    using multicast_subscription_uptr = std::unique_ptr<multicast_subscription>;

    class multicast_subscriber
    {
    public:
        multicast_subscriber(ipv4::address listen_address);

        void subscribe_to(ipv4::address address, port port);
        void unsubscribe_from(ipv4::address address);

    private:
        const ipv4::address listen_address_;
        std::map<ipv4::address, multicast_subscription_uptr> subscriptions_;
    };
}