include(CheckIPOSupported)

check_ipo_supported(RESULT ipo_supported)

macro(list_set_target_cpp_properties)
    bimo_set_target_cpp_properties()
endmacro()

macro(list_set_cpp_properties)
    bimo_set_cpp_properties()
    if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
        add_definitions(-D_SILENCE_ALL_CXX17_DEPRECATION_WARNINGS -DBOOST_CONFIG_SUPPRESS_OUTDATED_MESSAGE)
    endif ()
endmacro(list_set_cpp_properties)

####
macro(list_declare_library NAME)
    set(LIBRARY_NAME ${NAME})
    set(TEST_CASES_NAME ${NAME}_unit_tests)
    set(HAVE_TESTS OFF)

    if (IS_DIRECTORY "${CMAKE_CURRENT_LIST_DIR}/unit_tests")
        set(HAVE_TESTS ON)
    endif ()

    if (BUILD_TESTS AND HAVE_TESTS)
        list_add_test(${TEST_CASES_NAME})
    endif ()

    list_add_library(${LIBRARY_NAME})

    # Link unit tests with the library
    if (BUILD_TESTS AND HAVE_TESTS)
        target_link_libraries(${TEST_CASES_NAME} ${LIBRARY_NAME})
    endif ()

endmacro()

##
# This macro generates a LIST Library project
##
macro(list_add_library NAME)
    project(${NAME} CXX)

    list_set_cpp_properties()

    file(GLOB_RECURSE ${NAME}_source_files lib/*.cpp lib/*.h)
    add_library(${NAME} STATIC ${${NAME}_source_files})
    source_group(TREE ${PROJECT_SOURCE_DIR}/lib FILES ${${NAME}_source_files})

    target_include_directories(${NAME}
            PUBLIC
            $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/lib/include>
            $<BUILD_INTERFACE:${PROJECT_BINARY_DIR}/include>
            $<INSTALL_INTERFACE:include>
            PRIVATE
            lib/src
            )

    list_set_target_cpp_properties()

    set_target_properties(${NAME} PROPERTIES FOLDER "libs")
    message(STATUS "Found ${NAME}")

    if (ipo_supported)
#        set_property(TARGET ${NAME} PROPERTY INTERPROCEDURAL_OPTIMIZATION TRUE)
    endif ()
endmacro()

##
# This macro generates a LIST Library project
# It assumes that all tests will use LIST test lib
##

macro(list_add_test NAME)
    project(${NAME})

    list_set_cpp_properties()

    file(GLOB_RECURSE ${NAME}_test_files unit_tests/*.cpp unit_tests/*.h)
    add_executable(${NAME} ${${NAME}_test_files})
    source_group(TREE ${PROJECT_SOURCE_DIR}/unit_tests FILES ${${NAME}_test_files})

    list_set_target_cpp_properties()
    target_include_directories(${NAME} PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/unit_tests)

    target_link_libraries(${NAME} ebu_list_test_lib)
    set_target_properties(${NAME} PROPERTIES FOLDER "unit_tests")

    # add_test can have arbitrary names
    cmake_policy(SET CMP0110 NEW)

    catch_discover_tests(${NAME})
    message(STATUS "Found ${NAME}")
endmacro()

macro(list_add_executable NAME)
    project(${NAME} CXX)

    list_set_cpp_properties()

    file(GLOB_RECURSE ${NAME}_source_files *.cpp *.h)
    add_executable(${NAME} ${${NAME}_source_files})
    source_group(TREE ${PROJECT_SOURCE_DIR} FILES ${${NAME}_source_files})

    target_include_directories(${PROJECT_NAME} PRIVATE .)

    list_set_target_cpp_properties()

    set_target_properties(${PROJECT_NAME} PROPERTIES FOLDER "apps")
    message(STATUS "Found ${NAME}")

    if (ipo_supported)
#        set_property(TARGET ${NAME} PROPERTY INTERPROCEDURAL_OPTIMIZATION TRUE)
    endif ()

endmacro()
