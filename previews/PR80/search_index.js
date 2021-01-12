var documenterSearchIndex = {"docs":
[{"location":"wavefront_ops/#Wavefront-Operations","page":"Wavefront Operations","title":"Wavefront Operations","text":"","category":"section"},{"location":"wavefront_ops/","page":"Wavefront Operations","title":"Wavefront Operations","text":"These intrinsics provide efficient operations across wavefronts.","category":"page"},{"location":"wavefront_ops/","page":"Wavefront Operations","title":"Wavefront Operations","text":"AMDGPU.wfred","category":"page"},{"location":"wavefront_ops/#AMDGPU.wfred","page":"Wavefront Operations","title":"AMDGPU.wfred","text":"wfred(op::Function, val::T) where T -> T\n\nPerforms a wavefront-wide reduction on val in each lane, and returns the result. A limited subset of functions are available to be passed as op. When op is one of (+, max, min, &, |, ⊻), T may be <:Union{Cint, Clong, Cuint, Culong}. When op is one of (+, max, min), T may also be <:Union{Float32, Float64}.\n\n\n\n\n\n","category":"function"},{"location":"execution_control/#Execution-Control-and-Intrinsics","page":"Execution Control","title":"Execution Control and Intrinsics","text":"","category":"section"},{"location":"execution_control/","page":"Execution Control","title":"Execution Control","text":"GPU execution is similar to CPU execution in some ways, although there are many differences. AMD GPUs have Compute Units (CUs), which can be thought of like CPU cores. Those CUs have (on pre-Navi architectures) 64 \"shader processors\", which are essentially the same as CPU SIMD lanes. The lanes in a CU operate in lockstep just like CPU SIMD lanes, and have execution masks and various kinds of SIMD instructions available. CUs execute wavefronts, which are pieces of work split off from a single kernel launch. A single CU can run one out of many wavefronts (one is chosen by the CU scheduler each cycle), which allows for very efficient parallel and concurrent execution on the device. Each wavefront runs independently of the other wavefronts, only stopping to synchronize with other wavefronts or terminate when specified by the program.","category":"page"},{"location":"execution_control/","page":"Execution Control","title":"Execution Control","text":"We can control wavefront execution through a variety of intrinsics provided by ROCm. For example, the endpgm() intrinsic stops the current wavefront's execution, and is also automatically inserted by the compiler at the end of each kernel (except in certain unique cases).","category":"page"},{"location":"execution_control/","page":"Execution Control","title":"Execution Control","text":"signal_completion(x) signals the \"kernel doorbell\" with the value x, which is the signal checked by the CPU wait call to determine when the kernel has completed. This doorbell is set to 0 automatically by GPU hardware once the kernel is complete.","category":"page"},{"location":"execution_control/","page":"Execution Control","title":"Execution Control","text":"sendmsg(x,y=0) and sendmsghalt(x,y=0) can be used to signal special conditions to the scheduler/hardware, such as making requests to stop wavefront generation, or halt all running wavefronts. Check the ISA manual for details!","category":"page"},{"location":"api/#AMDGPU-API-Reference","page":"API Reference","title":"AMDGPU API Reference","text":"","category":"section"},{"location":"api/#Kernel-launching","page":"API Reference","title":"Kernel launching","text":"","category":"section"},{"location":"api/","page":"API Reference","title":"API Reference","text":"@roc\nAMDGPU.AbstractKernel\nAMDGPU.HostKernel\nAMDGPU.rocfunction","category":"page"},{"location":"api/#AMDGPU.@roc","page":"API Reference","title":"AMDGPU.@roc","text":"@roc [kwargs...] func(args...)\n\nHigh-level interface for executing code on a GPU. The @roc macro should prefix a call, with func a callable function or object that should return nothing. It will be compiled to a GCN function upon first use, and to a certain extent arguments will be converted and managed automatically using rocconvert. Finally, a call to roccall is performed, scheduling a kernel launch on the specified (or default) HSA queue.\n\nSeveral keyword arguments are supported that influence the behavior of @roc.\n\ndynamic: use dynamic parallelism to launch device-side kernels\narguments that influence kernel compilation: see rocfunction and dynamic_rocfunction\narguments that influence kernel launch: see AMDGPU.HostKernel and AMDGPU.DeviceKernel\n\nThe underlying operations (argument conversion, kernel compilation, kernel call) can be performed explicitly when more control is needed, e.g. to reflect on the resource usage of a kernel to determine the launch configuration. A host-side kernel launch is done as follows:\n\nargs = ...\nGC.@preserve args begin\n    kernel_args = rocconvert.(args)\n    kernel_tt = Tuple{Core.Typeof.(kernel_args)...}\n    kernel = rocfunction(f, kernel_tt; compilation_kwargs)\n    kernel(kernel_args...; launch_kwargs)\nend\n\nA device-side launch, aka. dynamic parallelism, is similar but more restricted:\n\nargs = ...\n# GC.@preserve is not supported\n# we're on the device already, so no need to rocconvert\nkernel_tt = Tuple{Core.Typeof(args[1]), ...}    # this needs to be fully inferred!\nkernel = dynamic_rocfunction(f, kernel_tt)       # no compiler kwargs supported\nkernel(args...; launch_kwargs)\n\n\n\n\n\n","category":"macro"},{"location":"api/#AMDGPU.AbstractKernel","page":"API Reference","title":"AMDGPU.AbstractKernel","text":"(::HostKernel)(args...; kwargs...)\n(::DeviceKernel)(args...; kwargs...)\n\nLow-level interface to call a compiled kernel, passing GPU-compatible arguments in args. For a higher-level interface, use AMDGPU.@roc.\n\nThe following keyword arguments are supported:\n\ngroupsize or threads (defaults to 1)\ngridsize or blocks (defaults to 1)\nconfig: callback function to dynamically compute the launch configuration. should accept a HostKernel and return a name tuple with any of the above as fields.\nqueue (defaults to the default queue)\n\n\n\n\n\n","category":"type"},{"location":"api/#AMDGPU.HostKernel","page":"API Reference","title":"AMDGPU.HostKernel","text":"(::HostKernel)(args...; kwargs...)\n(::DeviceKernel)(args...; kwargs...)\n\nLow-level interface to call a compiled kernel, passing GPU-compatible arguments in args. For a higher-level interface, use AMDGPU.@roc.\n\nThe following keyword arguments are supported:\n\ngroupsize or threads (defaults to 1)\ngridsize or blocks (defaults to 1)\nconfig: callback function to dynamically compute the launch configuration. should accept a HostKernel and return a name tuple with any of the above as fields.\nqueue (defaults to the default queue)\n\n\n\n\n\n\n\n","category":"type"},{"location":"api/#AMDGPU.rocfunction","page":"API Reference","title":"AMDGPU.rocfunction","text":"rocfunction(f, tt=Tuple{}; kwargs...)\n\nLow-level interface to compile a function invocation for the currently-active GPU, returning a callable kernel object. For a higher-level interface, use @roc.\n\nThe following keyword arguments are supported:\n\nname: override the name that the kernel will have in the generated code\n\nThe output of this function is automatically cached, i.e. you can simply call rocfunction in a hot path without degrading performance. New code will be generated automatically, when when function changes, or when different types or keyword arguments are provided.\n\n\n\n\n\n","category":"function"},{"location":"api/#Device-code-API","page":"API Reference","title":"Device code API","text":"","category":"section"},{"location":"api/#Thread-indexing","page":"API Reference","title":"Thread indexing","text":"","category":"section"},{"location":"api/#HSA-nomenclature","page":"API Reference","title":"HSA nomenclature","text":"","category":"section"},{"location":"api/","page":"API Reference","title":"API Reference","text":"workitemIdx\nworkgroupIdx\nworkgroupDim\ngridDim\ngridDimWG","category":"page"},{"location":"api/#AMDGPU.workitemIdx","page":"API Reference","title":"AMDGPU.workitemIdx","text":"workitemIdx()::ROCDim3\n\nReturns the work item index within the work group. See also: threadIdx\n\n\n\n\n\n","category":"function"},{"location":"api/#AMDGPU.workgroupIdx","page":"API Reference","title":"AMDGPU.workgroupIdx","text":"workgroupIdx()::ROCDim3\n\nReturns the work group index. See also: blockIdx\n\n\n\n\n\n","category":"function"},{"location":"api/#AMDGPU.workgroupDim","page":"API Reference","title":"AMDGPU.workgroupDim","text":"workgroupDim()::ROCDim3\n\nReturns the size of each workgroup in workitems. See also: blockDim\n\n\n\n\n\n","category":"function"},{"location":"api/#AMDGPU.gridDim","page":"API Reference","title":"AMDGPU.gridDim","text":"gridDim()::ROCDim3\n\nReturns the size of the grid in workitems. This behaviour is different from CUDA where gridDim gives the size of the grid in blocks.\n\n\n\n\n\n","category":"function"},{"location":"api/#AMDGPU.gridDimWG","page":"API Reference","title":"AMDGPU.gridDimWG","text":"gridDimWG()::ROCDim3\n\nReturns the size of the grid in workgroups. This is equivalent to CUDA's gridDim.\n\n\n\n\n\n","category":"function"},{"location":"api/#CUDA-nomenclature","page":"API Reference","title":"CUDA nomenclature","text":"","category":"section"},{"location":"api/","page":"API Reference","title":"API Reference","text":"Use these functions for compatibility with CUDAnative.jl.","category":"page"},{"location":"api/","page":"API Reference","title":"API Reference","text":"threadIdx\nblockIdx\nblockDim","category":"page"},{"location":"api/#AMDGPU.threadIdx","page":"API Reference","title":"AMDGPU.threadIdx","text":"threadIdx()::ROCDim3\n\nReturns the thread index within the block. See also: workitemIdx\n\n\n\n\n\n","category":"function"},{"location":"api/#AMDGPU.blockIdx","page":"API Reference","title":"AMDGPU.blockIdx","text":"blockIdx()::ROCDim3\n\nReturns the block index within the grid. See also: workgroupIdx\n\n\n\n\n\n","category":"function"},{"location":"api/#AMDGPU.blockDim","page":"API Reference","title":"AMDGPU.blockDim","text":"blockDim()::ROCDim3\n\nReturns the dimensions of the block. See also: workgroupDim\n\n\n\n\n\n","category":"function"},{"location":"api/#Synchronization","page":"API Reference","title":"Synchronization","text":"","category":"section"},{"location":"api/","page":"API Reference","title":"API Reference","text":"sync_workgroup","category":"page"},{"location":"api/#AMDGPU.sync_workgroup","page":"API Reference","title":"AMDGPU.sync_workgroup","text":"sync_workgroup()\n\nWaits until all wavefronts in a workgroup have reached this call.\n\n\n\n\n\n","category":"function"},{"location":"api/#Pointers","page":"API Reference","title":"Pointers","text":"","category":"section"},{"location":"api/","page":"API Reference","title":"API Reference","text":"AMDGPU.DevicePtr","category":"page"},{"location":"api/#Global-Variables","page":"API Reference","title":"Global Variables","text":"","category":"section"},{"location":"api/","page":"API Reference","title":"API Reference","text":"AMDGPU.get_global_pointer","category":"page"},{"location":"globals/#Global-Variables","page":"Global Variables","title":"Global Variables","text":"","category":"section"},{"location":"globals/","page":"Global Variables","title":"Global Variables","text":"Most programmers are familiar with the concept of a \"global variable\": a variable which is globally accessible to any function in the user's program. In Julia, programmers are told to avoid using global variables (also known as \"globals\") because of their tendency to introduce type instabilities. However, they're often useful for sharing data between functions in distinct areas of the user's program.","category":"page"},{"location":"globals/","page":"Global Variables","title":"Global Variables","text":"In the JuliaGPU ecosystem, globals in the Julia sense are not available unless their value is constant and inlinable into the function referencing them, as all GPU kernels must be statically compileable. However, a different sort of global variable is available which serves a very similar purpose. This variant of global variable is statically typed and sized, and is accessible from: all kernels with the same function signature (e.g. mykernel(a::Int32, b::Float64)), the CPU host, and other devices and kernels when accessed by pointer.","category":"page"},{"location":"globals/","page":"Global Variables","title":"Global Variables","text":"Global variables can be created within kernels with the AMDGPU.get_global_pointer function, which both declares the global variable, and returns a pointer to it (specifically a AMDGPU.DevicePtr). Once a kernel which declares a global is compiled for GPU execution (either by @roc or rocfunction), the global is allocated memory and made available to the kernel (during the linking stage). Globals are unique by name, and so you shouldn't attempt to call get_global_pointer with the same name but a different type; if you do, undefined behavior will result. Like regular pointers in Julia, you can use functions like Base.unsafe_load and Base.unsafe_store! to read from and write to the global variable, respectively.","category":"page"},{"location":"globals/","page":"Global Variables","title":"Global Variables","text":"As a concrete example of global variable usage, let's define a kernel which creates a global and uses its value to increment the indices of an array:","category":"page"},{"location":"globals/","page":"Global Variables","title":"Global Variables","text":"function my_kernel(A)\n    idx = workitemIdx().x\n    ptr = AMDGPU.get_global_pointer(Val(:myglobal), Float32)\n    A[idx] += Base.unsafe_load(ptr)\n    nothing\nend","category":"page"},{"location":"globals/","page":"Global Variables","title":"Global Variables","text":"In order to access and modify this global before the kernel is launched, we can specify a hook function to @roc which will be passed the global pointer as an argument:","category":"page"},{"location":"globals/","page":"Global Variables","title":"Global Variables","text":"function myglobal_hook(gbl, mod, dev)\n    gbl_ptr = Base.unsafe_convert(Ptr{Float32}, gbl.ptr)\n    Base.unsafe_store!(gbl_ptr, 42f0)\nend\nRA = ROCArray(ones(Float32, 4))\nwait(@roc groupsize=4 global_hooks=(myglobal=myglobal_hook,) my_kernel(RA))","category":"page"},{"location":"globals/","page":"Global Variables","title":"Global Variables","text":"In the above function, gbl_ptr is a pointer (specifically a Ptr{Float32}) to the memory that represents the global variable myglobal. We can't guarantee the initial value of an uninitialized global variable, so we need to write a value to that global variable (in this case 42::Float32).","category":"page"},{"location":"globals/","page":"Global Variables","title":"Global Variables","text":"We can then read the values of HA and see that it's what we expect:","category":"page"},{"location":"globals/","page":"Global Variables","title":"Global Variables","text":"julia> A = Array(HA)\n4-element HSAArray{Float32,1}:\n 43.0\n 43.0\n 43.0\n 43.0","category":"page"},{"location":"quickstart/#Quick-Start","page":"Quick Start","title":"Quick Start","text":"","category":"section"},{"location":"quickstart/#Installation","page":"Quick Start","title":"Installation","text":"","category":"section"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"After making sure that your ROCm stack is installed and working, simply add the AMDGPU.jl package to your Julia environment:","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"]add AMDGPU","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"If everything ran successfully, you can try loading the AMDGPU package and running the unit tests:","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"using AMDGPU\n]test AMDGPU","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"warning: Warning\nIf you get an error message along the lines of GLIB_CXX_... not found, it's possible that the C++ runtime used to build the ROCm stack and the one used by Julia are different. If you built the ROCm stack yourself this is very likely the case since Julia normally ships with its own C++ runtime. For more information, check out this GitHub issue.A quick fix is to use the LD_PRELOAD environment variable to make Julia use the system C++ runtime library, for example:LD_PRELOAD=/usr/lib/libstdc++.so juliaAlternatively, you can build Julia from sources as described here.You can quickly debug this issue by starting Julia and trying to load a ROCm library:using Libdl\nLibdl.dlopen(\"/opt/rocm/hsa/lib/libhsa-runtime64.so\")","category":"page"},{"location":"quickstart/#Running-a-simple-kernel","page":"Quick Start","title":"Running a simple kernel","text":"","category":"section"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"As a simple test, we will try to add two random vectors and make sure that the results from the CPU and the GPU are indeed the same.","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"We can start by first performing this simple calculation on the CPU:","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"N = 32\na = rand(Float64, N)\nb = rand(Float64, N)\nc_cpu = a + b","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"To do the same computation on the GPU, we first need to copy the two input arrays a and b to the device. Toward that end, we will use the HSAArray type to represent our GPU arrays. We can create the two arrays by passing the host data to the constructor as follows:","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"using AMDGPU\na_d = HSAArray(a)\nb_d = HSAArray(b)","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"We need to create one additional array c_d to store the results:","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"c_d = similar(a_d)","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"note: Note\nHSAArray is a lightweight low-level array type, that does not support the GPUArrays.jl interface. Production code should instead use ROCArray once its ready, in a similar fashion to CuArray.","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"In this example, the postfix _d distinguishes a device memory object from its host memory counterpart. This convention is completely arbitrary and you may name your device-side variables whatever you like; they are regular Julia variables.","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"Next, we will define the GPU kernel that does the actual computation:","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"function vadd!(c, a, b)\n    i = workitemIdx().x\n    c[i] = a[i] + b[i]\n    return\nend","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"This simple kernel starts by getting the current thread ID using workitemIdx and then performs the addition of the elements from a and b, storing the result in c.","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"Notice how we explicitly specify that this function does not return a value by adding the return statement. This is necessary for all GPU kernels and we can enforce it by adding a return, return nothing, or even nothing at the end of the kernel. If this statement is omitted, Julia will attempt to return the value of the last evaluated expression, in this case a Float64, which will cause a compilation failure as kernels cannot return values.","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"The easiest way to launch a GPU kernel is with the @roc macro, specifying that we want a single work group with N work items and calling it like an ordinary function:","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"@roc groupsize=N vadd!(c_d, a_d, b_d)","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"Keep in mind that kernel launches are asynchronous, meaning that you need to do some kind of synchronization before you use the result. For instance, you can call wait() on the returned HSA signal value:","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"wait(@roc groupsize=N vadd!(c_d, a_d, b_d))","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"warning: Naming conventions\nThroughout this example we use terms like \"work group\" and \"work item\". These terms are used by the Khronos consortium and their APIs including OpenCL and Vulkan, as well as the HSA foundation.NVIDIA, on the other hand, uses some different terms in their CUDA API, which might be confusing to some users porting their kernels from CUDA to AMDGPU. As a quick summary, here is a mapping of the most common terms:AMDGPU CUDA\nworkitemIdx threadIdx\nworkgroupIdx blockIdx\nworkgroupDim blockDim\ngridDim No equivalent\ngridDimWG gridDim\ngroupsize threads\ngridsize blocks * threads\nqueue streamFor compatibilty reasons, the symbols in the CUDAnative column (except for gridDim) are also supported by AMDGPU.","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"Finally, we can make sure that the results match, by first copying the data to the host and then comparing it with the CPU results:","category":"page"},{"location":"quickstart/","page":"Quick Start","title":"Quick Start","text":"c = Array(c_d)\n\nusing Test\n@test isapprox(c, c_cpu)","category":"page"},{"location":"memory/#Memory-Allocation-and-Intrinsics","page":"Memory","title":"Memory Allocation and Intrinsics","text":"","category":"section"},{"location":"memory/#Memory-Varieties","page":"Memory","title":"Memory Varieties","text":"","category":"section"},{"location":"memory/","page":"Memory","title":"Memory","text":"GPUs contain various kinds of memory, just like CPUs:","category":"page"},{"location":"memory/","page":"Memory","title":"Memory","text":"Global: Globally accessible by all CUs on a GPU, and possibly accessible from outside of the GPU (by the CPU host, by other GPUs, by PCIe devices, etc.). Slowest form of memory.\nConstant: Same as global memory, but signals to the hardware that it can use special instructions to access and cache this memory. Can be changed between kernel invocations.\nRegion: Also known as Global Data Store (GDS), all wavefronts on a CU can access the same memory region from the same address. Faster than Global/Constant. Automatically allocated by the compiler/runtime, not user accessible.\nLocal: Also known as Local Data Store (LDS), all wavefronts in the same workgroup can access the same memory region from the same address. Faster than GDS.\nPrivate: Uses the hardware scratch space, and is private to each SIMD lane in a wavefront. Fastest form of traditional memory.","category":"page"},{"location":"memory/#Memory-Allocation/Deallocation","page":"Memory","title":"Memory Allocation/Deallocation","text":"","category":"section"},{"location":"memory/","page":"Memory","title":"Memory","text":"Currently, we can explicitly allocate Global and Local memory from within kernels, and Global from outside of kernels. Global memory allocations are done with AMDGPU.Mem.alloc, like so:","category":"page"},{"location":"memory/","page":"Memory","title":"Memory","text":"buf = Mem.alloc(agent, bytes)","category":"page"},{"location":"memory/","page":"Memory","title":"Memory","text":"buf in this example is a Mem.Buffer, which contains a pointer that points to the allocated memory. The buffer can be converted to a pointer by doing Base.unsafe_convert(Ptr{Nothing}, buf), and may then be converted to the appropriate pointer type, and loaded from/stored to. By default, memory is allocated specifically on and for agent, and is only accessible to that agent unless transferred using the various functions in the Mem module. If memory should be globally accessible by the CPU and by all GPUs, the kwarg coherent=true may be passed, which utilizes Unified Memory instead. Memory should be freed once it's no longer in use with Mem.free(buf).","category":"page"},{"location":"memory/","page":"Memory","title":"Memory","text":"Global memory allocated by a kernel is automatically freed when the kernel completes, which is done in the wait call on the host. This behavior can be disabled by passing cleanup=false to wait.","category":"page"},{"location":"memory/","page":"Memory","title":"Memory","text":"Global memory may also be allocated and freed dynamically from kernels by calling AMDGPU.malloc(::Csize_t)::Ptr{Cvoid} and AMDGPU.free(::Ptr{Cvoid}). This memory allocation/deallocation uses hostcalls to operate, and so is relatively slow, but is also very useful. Currently, memory allocated with AMDGPU.malloc is coherent.","category":"page"},{"location":"memory/","page":"Memory","title":"Memory","text":"Local memory may be allocated within a kernel by calling alloc_local(id, T, len), where id is some sort of bitstype ID for the local allocation, T is the Julia element type, and len is the number of elements of type T to allocate. Local memory does not need to be freed, as it is automatically allocated/freed by the hardware.","category":"page"},{"location":"memory/#Memory-Modification-Intrinsics","page":"Memory","title":"Memory Modification Intrinsics","text":"","category":"section"},{"location":"memory/","page":"Memory","title":"Memory","text":"Like C, AMDGPU.jl provides the memset! and memcpy! intrinsics, which are useful for setting a memory region to a value, or copying one region to another, respectively. Check test/device/memory.jl for examples of their usage.","category":"page"},{"location":"#Programming-AMD-GPUs-with-Julia","page":"Home","title":"Programming AMD GPUs with Julia","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"tip: Tip\nThis documentation assumes that you are familiar with the main concepts of GPU programming and mostly describes the specifics of running Julia code on AMD GPUs. For a much more gentle introduction to GPGPU with Julia consult the well-written CUDA.jl documentation.","category":"page"},{"location":"#The-ROCm-stack","page":"Home","title":"The ROCm stack","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"ROCm (short for Radeon Open Compute platforM) is AMD's open-source GPU computing platform, supported by most modern AMD GPUs (detailed hardware support) and some AMD APUs. ROCm works solely on Linux and no plans to support either Windows or macOS have been announced by AMD.","category":"page"},{"location":"","page":"Home","title":"Home","text":"A necessary prerequisite to use this Julia package is to have a working ROCm stack installed. A quick way to verify this is to check the output of rocminfo. For more information, consult the official installation guide. Even though the only platforms officially supported by AMD are certain versions of Ubuntu, CentOS, RHEL, and SLES [1], there are options to install ROCm on other Linux distributions, including:","category":"page"},{"location":"","page":"Home","title":"Home","text":"Arch Linux - See the rocm-arch repository or the slightly older PKGBUILDs in the AUR.\nGentoo - Check Portage for the rocr-runtime package and justxi's rocm repo for unofficial ROCm package ebuilds.","category":"page"},{"location":"","page":"Home","title":"Home","text":"[1]: https://github.com/RadeonOpenCompute/ROCm/wiki#supported-operating-systems","category":"page"},{"location":"","page":"Home","title":"Home","text":"Even though you don't need HIP to use Julia on AMDGPU, it might be wise to make sure that you can build and run simple HIP programs to ensure that your ROCm installation works properly before trying to use it from Julia.","category":"page"},{"location":"#The-Julia-AMDGPU-stack","page":"Home","title":"The Julia AMDGPU stack","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Julia support for programming AMD GPUs is currently provided by the AMDGPU.jl package. This package contains everything necessary to program for AMD GPUs in Julia, including:","category":"page"},{"location":"","page":"Home","title":"Home","text":"An interface for working with the HSA runtime API, necessary for launching compiled kernels and controlling the GPU.\nAn interface for compiling and running kernels written in Julia through LLVM's AMDGPU backend.\nAn array type implementing the GPUArrays.jl interface, providing high-level array operations.","category":"page"},{"location":"#Requirements","page":"Home","title":"Requirements","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"ROCR\nROCT\nRecent Linux kernel with AMDGPU and HSA enabled","category":"page"},{"location":"#Setup-Instructions","page":"Home","title":"Setup Instructions","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Currently, the requirements to get everything working properly is a bit poorly documented in the upstream docs for any distro other than Ubuntu.  So here is a list of requirements I've found through the process of making this work:","category":"page"},{"location":"","page":"Home","title":"Home","text":"Make sure /dev/kfd has a group other than root that you can add your user to. I recommend adding your user to the \"video\" group, and setting the ownership of /dev/kfd to root:video with 660 permissions.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The correct libraries in your LDLIBRARYPATH or standard library locations:","category":"page"},{"location":"","page":"Home","title":"Home","text":"libhsa-runtime64.so\nlibhsakmt.so","category":"page"},{"location":"","page":"Home","title":"Home","text":"In terms of Linux kernel versions, just pick the newest one you can. If building your own kernel, make sure all the regular AMDGPU and HSA options are enabled.","category":"page"},{"location":"","page":"Home","title":"Home","text":"You will also need ld.lld installed on your system (provided by LLVM/Clang); if you built Julia from source, you should have a copy somewhere in deps/scratch/llvm-*/*/bin/ that you can add to your PATH.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Once all of this is setup properly, you should be able to ] build AMDGPU successfully; after that, if you have a supported GPU attached and enabled, ] test AMDGPU should work exactly as you might expect.","category":"page"},{"location":"kernel_deps/#Kernel-Dependencies","page":"Kernel Dependencies","title":"Kernel Dependencies","text":"","category":"section"},{"location":"kernel_deps/","page":"Kernel Dependencies","title":"Kernel Dependencies","text":"Unlike CUDA, ROCm does not have blocking queues; instead, all kernels placed on a queue will usually be processed and scheduled immediately. There is one exception: barrier packets may be placed on the queue to block the GPU's queue packet processor from proceeding until a given set of kernels has completed. These barriers come in two flavors: barrier_and! and barrier_or!. These functions can be called on a queue with a given set of kernel signals (those returned from @roc) to wait for all kernels or any one kernel to complete, respectively.","category":"page"},{"location":"kernel_deps/","page":"Kernel Dependencies","title":"Kernel Dependencies","text":"Generally, the barrier_and! call should be the most useful tool for most users, since many codes require synchronization of all \"threads of execution\" at the end of one step before moving onto the next step. For example, the following code may look innocuous, but in fact the kernels might \"race\" and return unexpected results:","category":"page"},{"location":"kernel_deps/","page":"Kernel Dependencies","title":"Kernel Dependencies","text":"function kernel(A)\n    A[1] += 1.0\n    nothing\nend\n\nRA = ROCArray(zeros(Float64, 1))\n@roc kernel(RA)\n@roc kernel(RA)\n@show Array(RA)[1] # could be 1.0 or 2.0","category":"page"},{"location":"kernel_deps/","page":"Kernel Dependencies","title":"Kernel Dependencies","text":"To fix this example, we use a barrier_and! call to ensure proper ordering of execution:","category":"page"},{"location":"kernel_deps/","page":"Kernel Dependencies","title":"Kernel Dependencies","text":"RA = ROCArray(zeros(Float64, 1))\ns1 = @roc kernel(RA)\nbarrier_and!([s1])\ns2 = @roc kernel(RA)\nwait(s2)\n@show Array(RA)[1] # will always be 2.0","category":"page"},{"location":"kernel_deps/","page":"Kernel Dependencies","title":"Kernel Dependencies","text":"While likely less useful for most, barrier_or! can be useful in situations where any one of many \"input\" kernels can satisfy a condition necessary to allow later kernels to execute properly:","category":"page"},{"location":"kernel_deps/","page":"Kernel Dependencies","title":"Kernel Dependencies","text":"function kernel1(A, i)\n    A[1] = i\n    nothing\nend\nfunction kernel2(A, i)\n    A[2] = i/A[1]\nend\n\nRA = ROCArray(zeros(Float64, 2))\ns1 = @roc kernel1(RA, 1.0)\ns2 = @roc kernel1(RA, 2.0)\nbarrier_or!([s1,s2])\ns3 = @roc kernel2(RA, 3.0)\nwait(s3)\n@show Array(RA)[1] # will either be 3.0 or 1.5, but will never throw due to divide-by-zero","category":"page"},{"location":"kernel_deps/","page":"Kernel Dependencies","title":"Kernel Dependencies","text":"warning: Warning\nBecause of how barrier OR packets work, you can't use queue hardware to do a wait-any on more than 5 signals at a time. If more than 5 signals are specified, then the signals are split into sets of 5, and the total barrier won't be fulfilled until, for each set, one of the signals is satisfied.Contributions are welcome to workaround this issue, which will probably need to implemented in software either on the CPU or GPU side.","category":"page"},{"location":"exceptions/#Kernel-thrown-Exceptions","page":"Exceptions","title":"Kernel-thrown Exceptions","text":"","category":"section"},{"location":"exceptions/","page":"Exceptions","title":"Exceptions","text":"Just like regular CPU-executed Julia functions, GPU kernels can throw exceptions! For example, the following kernel will throw a KernelException:","category":"page"},{"location":"exceptions/","page":"Exceptions","title":"Exceptions","text":"function throwkernel(A)\n    A[0] = 1\nend\nHA = HSAArray(zeros(Int,1))\nwait(@roc throwkernel(HA))","category":"page"},{"location":"exceptions/","page":"Exceptions","title":"Exceptions","text":"Kernels that hit an exception will write some exception information into a pre-allocated list for the CPU to inspect. Once complete, the wavefront throwing the exception will stop itself, but other wavefronts will continue executing (possibly throwing their own exceptions, or not).","category":"page"},{"location":"exceptions/","page":"Exceptions","title":"Exceptions","text":"Kernel-thrown exceptions are thrown on the CPU in the call to wait(event), where event is the returned value of @roc calls. When the kernel signals that it's completed, the wait function will check if an exception flag has been set, and if it has, will collect all of the relevant exception information that the kernels set up. Unlike CPU execution, GPU kernel exceptions aren't very user-customizable and pretty (for now!). They don't call Base.show, but instead pass the LLVM function name of their exception handler (details in GPUCompiler, src/irgen.jl). Therefore, the exact error that occured might be a bit hard to figure out.","category":"page"},{"location":"exceptions/","page":"Exceptions","title":"Exceptions","text":"If exception checking turns out to be too expensive for your needs, you can disable those checks by passing the kwarg check_exceptions=false to the wait call, which will skip any error checking (although it will still wait for the kernel to signal completion).","category":"page"}]
}
