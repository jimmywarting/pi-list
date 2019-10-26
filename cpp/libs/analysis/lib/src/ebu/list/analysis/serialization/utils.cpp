#include "ebu/list/analysis/serialization/utils.h"

#include <fstream>
#include <iomanip>

using namespace ebu_list;

void analysis::write_json_to(const path& dir, const std::string& filename, const nlohmann::json& content)
{
    std::experimental::filesystem::create_directories(dir);
    const auto info_path = dir / filename;

    std::ofstream o(info_path.string());
    o << std::setw(4) << content << std::endl;
}