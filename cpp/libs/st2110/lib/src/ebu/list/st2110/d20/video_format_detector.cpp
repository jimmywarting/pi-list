#include "ebu/list/st2110/d20/video_format_detector.h"
#include "ebu/list/st2110/d20/packet.h"

using namespace ebu_list::st2110::d20;
using namespace ebu_list::st2110;
using namespace ebu_list;

//------------------------------------------------------------------------------
namespace
{
    constexpr auto maximum_packets_per_frame = 30000; // TODO: this is enough for UHD
    constexpr auto minimum_packets_per_frame = 100;

    std::tuple<int, int> get_dimensions_from_max_line(int max_line, bool is_field_based)
    {
        if(is_field_based)
        {
            switch(max_line)
            {
            case 239: return {720, 480};
            case 242: return {720, 486};
            case 287: return {720, 576};
            case 539: return {1920, 1080};

            default: break;
            }
        }
        else
        {
            switch(max_line)
            {
            case 719: return {1280, 720};
            case 1079: return {1920, 1080};
            case 2159: return {3840, 2160}; // TODO: calculate width correctly

            default: break;
            }
        }

        // TODO: check this
        return {0, 0};
    }
} // namespace

//------------------------------------------------------------------------------

detector::status_description line_data_analyzer::handle_data(const rtp::packet& packet)
{
    auto& sdu = packet.sdu;

    constexpr auto minimum_size = ssizeof<raw_extended_sequence_number>() + ssizeof<raw_line_header>();
    if(sdu.view().size() < minimum_size)
    {
        // logger()->error("Packet size smaller than minimum: {}", sdu.view().size());
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_FORMAT_NO_MINIMUM_SIZE"};
    }

    auto p         = sdu.view().data();
    const auto end = sdu.view().data() + sdu.view().size();

    // skip esn
    p += sizeof(raw_extended_sequence_number);

    while(p < end)
    {
        const auto line_header = line_header_lens(*reinterpret_cast<const raw_line_header*>(p));
        p += sizeof(raw_line_header);

        max_line_number_ = std::max(max_line_number_, int(line_header.line_number()));

        is_field_based_ |= (line_header.field_identification() != 0);

        if(!line_header.continuation()) break;
    }

    return detector::status_description{/*.state*/ detector::state::detecting,
                                        /*.error_code*/ "STATUS_CODE_FORMAT_DETECTING"};
}

int line_data_analyzer::max_line_number() const noexcept
{
    return max_line_number_;
}

bool line_data_analyzer::is_field_based() const noexcept
{
    return is_field_based_;
}

//------------------------------------------------------------------------------

video_format_detector::video_format_detector() : detector_({maximum_packets_per_frame, minimum_packets_per_frame})
{
}

detector::status_description video_format_detector::handle_data(const rtp::packet& packet)
{
    const auto la_result = line_analyzer_.handle_data(packet);
    if(la_result.state == detector::state::invalid) return la_result;
    const auto sa_result = spacing_analyzer_.handle_data(packet);
    if(sa_result.state == detector::state::invalid) return sa_result;

    return detector_.handle_data(packet);
}

detector::details video_format_detector::get_details() const
{
    auto result              = video_description{};
    result.packets_per_frame = detector_.packets_per_frame();
    result.rate              = detector_.rate();

    result.scan_type =
        (line_analyzer_.is_field_based() ? media::video::scan_type::INTERLACED : media::video::scan_type::PROGRESSIVE);

    const auto [width, height] =
        get_dimensions_from_max_line(line_analyzer_.max_line_number(), line_analyzer_.is_field_based());
    result.dimensions.width  = static_cast<uint16_t>(width);
    result.dimensions.height = static_cast<uint16_t>(height);
    result.schedule          = spacing_analyzer_.get_schedule();

    // TODO: set these via configuration
    result.color_depth = 10;
    result.sampling    = media::video::video_sampling::YCbCr_4_2_2;
    result.colorimetry = media::video::colorimetry::BT709;

    return result;
}
